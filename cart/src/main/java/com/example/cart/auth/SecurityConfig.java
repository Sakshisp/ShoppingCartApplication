// src/main/java/com/example/cart/auth/SecurityConfig.java
package com.example.cart.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.NoOpPasswordEncoder; // demo only
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;

    public SecurityConfig(JwtAuthFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // DEV user for quick testing; replace with JPA-backed service later
    @Bean
    public PasswordEncoder passwordEncoder() {
        return org.springframework.security.crypto.factory.PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public UserDetailsService users(
            @Value("${demo.user:testuser}") String user,
            @Value("${demo.pass:password123}") String pass) {

        UserDetails u = User.withUsername(user)
                .password("{noop}" + pass) // works with the delegating encoder
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(u);
    }


    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService uds, PasswordEncoder pe) {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(uds);
        provider.setPasswordEncoder(pe);
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())          // JWT: no sessions/csrf tokens
                .cors(Customizer.withDefaults())       // use the CORS bean below
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 💡 allow login + any other auth endpoints
                        .requestMatchers("/auth/**").permitAll()
                        // 💡 always allow preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // everything else requires JWT
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Global CORS
    @Bean
    public WebMvcConfigurer corsConfigurer(
            @Value("${cors.allowed-origins:http://localhost:3000}") String originsCsv) {
        String[] origins = originsCsv.split("\\s*,\\s*");
        return new WebMvcConfigurer() {
            @Override public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET","POST","PUT","DELETE","PATCH","OPTIONS")
                        .allowedHeaders("Authorization","Content-Type","X-User-Id")
                        .exposedHeaders("Authorization");
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${cors.allowed-origins:http://localhost:3000}") String originsCsv) {

        var cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(java.util.Arrays.asList(originsCsv.split("\\s*,\\s*")));
        cfg.setAllowedMethods(java.util.Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(java.util.Arrays.asList("Authorization","Content-Type","X-User-Id","X-Requested-With"));
        cfg.setExposedHeaders(java.util.Arrays.asList("Authorization"));
        cfg.setAllowCredentials(true); // optional; fine for dev

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
