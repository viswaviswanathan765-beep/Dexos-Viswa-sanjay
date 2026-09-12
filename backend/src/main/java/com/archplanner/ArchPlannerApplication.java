package com.archplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;

@SpringBootApplication
public class ArchPlannerApplication {
    public static void main(String[] args) {
        new File("./data").mkdirs();
        SpringApplication.run(ArchPlannerApplication.class, args);
    }
}