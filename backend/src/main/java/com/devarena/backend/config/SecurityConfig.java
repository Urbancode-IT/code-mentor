package com.devarena.backend.config;

import com.devarena.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ✅ IMPORTANT: Explicitly use your CORS config
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .csrf(csrf -> csrf.disable())

                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Allow preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public routes
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/problems/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/solutions/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/leaderboard/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/offers/**").permitAll()

                        // Admin routes
                        .requestMatchers(HttpMethod.POST, "/api/problems/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/problems/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/problems/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/offers").hasRole("ADMIN")

                        // Authenticated routes
                        .requestMatchers(HttpMethod.POST, "/api/solutions/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/solutions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/comments/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/likes/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/likes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/problem-likes/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/problem-likes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/offers/*/redeem").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/solutions/upload-screenshots").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/me/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/me/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/me/**").authenticated()

                        // Everything else
                        .anyRequest().permitAll()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
