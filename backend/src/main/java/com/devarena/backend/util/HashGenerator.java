package com.devarena.backend.util;
 
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashGenerator {
   public static void main(String[] args) {
      String password = "Urbancode@123"; // Replace with your actual password
      BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
      String hashedPassword = passwordEncoder.encode(password);
      System.out.println("Hashed Password: " + hashedPassword);
   }
}
