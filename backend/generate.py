import os

base_dir = r"D:\archplanner\backend"

files = {
    "pom.xml": """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.5</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.archplanner</groupId>
    <artifactId>archplanner-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>archplanner-backend</name>
    <description>ArchPlanner Backend</description>
    <properties>
        <java.version>21</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.xerial</groupId>
            <artifactId>sqlite-jdbc</artifactId>
            <version>3.45.1.0</version>
        </dependency>
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-community-dialects</artifactId>
            <version>6.4.4.Final</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>""",
    "src/main/resources/application.properties": """server.port=8080
spring.datasource.url=jdbc:sqlite:./data/archplanner.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jackson.serialization.WRITE_DATES_AS_TIMESTAMPS=false""",
    "src/main/java/com/archplanner/ArchPlannerApplication.java": """package com.archplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;

@SpringBootApplication
public class ArchPlannerApplication {
    public static void main(String[] args) {
        new File("./data").mkdirs();
        SpringApplication.run(ArchPlannerApplication.class, args);
    }
}""",
    "src/main/java/com/archplanner/config/WebConfig.java": """package com.archplanner.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("*")
                .allowedHeaders("*");
    }
}""",
    "src/main/java/com/archplanner/model/Project.java": """package com.archplanner.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    @OneToOne(mappedBy = "project", cascade = CascadeType.ALL)
    public Plot plot;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "projectId")
    public List<Room> rooms;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "projectId")
    public List<RoomRelationship> relationships;
}""",
    "src/main/java/com/archplanner/model/Plot.java": """package com.archplanner.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Plot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @OneToOne
    @JoinColumn(name = "projectId")
    @JsonIgnore
    public Project project;
    
    @Column(insertable=false, updatable=false)
    public Long projectId;
    
    public double width;
    public double depth;
    public String unit;
    public String orientation;
    public String roadSide;
    public double frontSetback;
    public double rearSetback;
    public double leftSetback;
    public double rightSetback;
}""",
    "src/main/java/com/archplanner/model/Room.java": """package com.archplanner.model;

import jakarta.persistence.*;

@Entity
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long projectId;
    public Long floorPlanId;
    public String type;
    public String name;
    public int floor;
    public double x;
    public double y;
    public double width;
    public double height;
    public double area;
    public double minArea;
    public String priority;
    public boolean required;
    public int quantity;
}""",
    "src/main/java/com/archplanner/model/RoomRelationship.java": """package com.archplanner.model;

import jakarta.persistence.*;

@Entity
public class RoomRelationship {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long projectId;
    public String fromRoomType;
    public String toRoomType;
    public String relationshipType;
    public String priority;
}""",
    "src/main/java/com/archplanner/model/FloorPlan.java": """package com.archplanner.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class FloorPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long projectId;
    public LocalDateTime generatedAt;
    public int totalFloors;
    public double totalBuiltUpArea;
    public double validationScore;
    public String status;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "floorPlanId")
    public List<Room> rooms;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "floorPlanId")
    public List<ValidationResult> validationResults;
}""",
    "src/main/java/com/archplanner/model/ValidationResult.java": """package com.archplanner.model;

import jakarta.persistence.*;

@Entity
@Table(name = "validation_results")
public class ValidationResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long floorPlanId;
    public String severity;
    public String category;
    public String message;
    public String affectedRooms;
    public String suggestedFix;
}""",
    "src/main/java/com/archplanner/model/CostEstimate.java": """package com.archplanner.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cost_estimates")
public class CostEstimate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long floorPlanId;
    public double builtUpArea;
    public double ratePerSqFt;
    public double totalCost;
    public double structureCost;
    public double flooringCost;
    public double electricalCost;
    public double plumbingCost;
    public double finishesCost;
    public String finishQuality;
}""",
    "src/main/java/com/archplanner/dto/CreateProjectRequest.java": """package com.archplanner.dto;
import java.util.List;
public class CreateProjectRequest {
    public String projectName;
    public PlotSpec plot;
    public List<RoomSpec> rooms;
    public List<RelationshipSpec> relationships;
    public String naturalLanguageInput;
}""",
    "src/main/java/com/archplanner/dto/PlotSpec.java": """package com.archplanner.dto;
public class PlotSpec {
    public double width;
    public double depth;
    public String unit;
    public String orientation;
    public String roadSide;
    public double frontSetback;
    public double rearSetback;
    public double leftSetback;
    public double rightSetback;
}""",
    "src/main/java/com/archplanner/dto/RoomSpec.java": """package com.archplanner.dto;
public class RoomSpec {
    public String type;
    public String name;
    public double minArea;
    public String priority;
    public boolean required;
    public int quantity;
    public double preferredWidth;
    public double preferredHeight;
}""",
    "src/main/java/com/archplanner/dto/RelationshipSpec.java": """package com.archplanner.dto;
public class RelationshipSpec {
    public String fromRoomType;
    public String toRoomType;
    public String relationshipType;
    public String priority;
}""",
    "src/main/java/com/archplanner/dto/ProjectResponse.java": """package com.archplanner.dto;
import java.time.LocalDateTime;
import java.util.List;
public class ProjectResponse {
    public Long id;
    public String name;
    public PlotSpec plot;
    public List<RoomSpec> rooms;
    public List<RelationshipSpec> relationships;
    public LocalDateTime createdAt;
}""",
    "src/main/java/com/archplanner/dto/PlanResponse.java": """package com.archplanner.dto;
import java.util.List;
public class PlanResponse {
    public Long planId;
    public Long projectId;
    public int totalFloors;
    public double totalBuiltUpArea;
    public double validationScore;
    public List<RoomDTO> rooms;
    public List<ValidationDTO> validations;
    public CostDTO cost;
}""",
    "src/main/java/com/archplanner/dto/RoomDTO.java": """package com.archplanner.dto;
import java.util.List;
public class RoomDTO {
    public Long id;
    public String type;
    public String name;
    public int floor;
    public double x;
    public double y;
    public double width;
    public double height;
    public double area;
    public List<DoorDTO> doors;
    public List<WindowDTO> windows;
}""",
    "src/main/java/com/archplanner/dto/DoorDTO.java": """package com.archplanner.dto;
public class DoorDTO {
    public double x;
    public double y;
    public double width;
    public String side;
}""",
    "src/main/java/com/archplanner/dto/WindowDTO.java": """package com.archplanner.dto;
public class WindowDTO {
    public double x;
    public double y;
    public double width;
    public String side;
}""",
    "src/main/java/com/archplanner/dto/ValidationDTO.java": """package com.archplanner.dto;
public class ValidationDTO {
    public String severity;
    public String category;
    public String message;
    public String affectedRooms;
    public String suggestedFix;
}""",
    "src/main/java/com/archplanner/dto/CostDTO.java": """package com.archplanner.dto;
public class CostDTO {
    public double builtUpArea;
    public double ratePerSqFt;
    public double totalCost;
    public double structureCost;
    public double flooringCost;
    public double electricalCost;
    public double plumbingCost;
    public double finishesCost;
    public String finishQuality;
}""",
    "src/main/java/com/archplanner/dto/InterpretRequest.java": """package com.archplanner.dto;
public class InterpretRequest {
    public String naturalLanguageInput;
}""",
    "src/main/java/com/archplanner/dto/InterpretResponse.java": """package com.archplanner.dto;
import java.util.List;
public class InterpretResponse {
    public PlotSpec plot;
    public int floors;
    public List<RoomSpec> rooms;
    public List<RelationshipSpec> relationships;
    public List<String> preferences;
    public List<String> warnings;
    public boolean fallbackMode;
}""",
    "src/main/java/com/archplanner/dto/ChatRequest.java": """package com.archplanner.dto;
public class ChatRequest {
    public String message;
}""",
    "src/main/java/com/archplanner/dto/ChatResponse.java": """package com.archplanner.dto;
import java.util.List;
public class ChatResponse {
    public String response;
    public List<String> suggestions;
    public boolean fallbackMode;
}""",
    "src/main/java/com/archplanner/repository/ProjectRepository.java": """package com.archplanner.repository;
import com.archplanner.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProjectRepository extends JpaRepository<Project, Long> {}""",
    "src/main/java/com/archplanner/repository/PlotRepository.java": """package com.archplanner.repository;
import com.archplanner.model.Plot;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PlotRepository extends JpaRepository<Plot, Long> {}""",
    "src/main/java/com/archplanner/repository/RoomRepository.java": """package com.archplanner.repository;
import com.archplanner.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByProjectId(Long projectId);
    List<Room> findByFloorPlanId(Long floorPlanId);
}""",
    "src/main/java/com/archplanner/repository/RoomRelationshipRepository.java": """package com.archplanner.repository;
import com.archplanner.model.RoomRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RoomRelationshipRepository extends JpaRepository<RoomRelationship, Long> {
    List<RoomRelationship> findByProjectId(Long projectId);
}""",
    "src/main/java/com/archplanner/repository/FloorPlanRepository.java": """package com.archplanner.repository;
import com.archplanner.model.FloorPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FloorPlanRepository extends JpaRepository<FloorPlan, Long> {
    List<FloorPlan> findByProjectIdOrderByIdDesc(Long projectId);
}""",
    "src/main/java/com/archplanner/repository/ValidationResultRepository.java": """package com.archplanner.repository;
import com.archplanner.model.ValidationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ValidationResultRepository extends JpaRepository<ValidationResult, Long> {
    List<ValidationResult> findByFloorPlanId(Long floorPlanId);
}""",
    "src/main/java/com/archplanner/repository/CostEstimateRepository.java": """package com.archplanner.repository;
import com.archplanner.model.CostEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CostEstimateRepository extends JpaRepository<CostEstimate, Long> {
    Optional<CostEstimate> findByFloorPlanId(Long floorPlanId);
}""",
    "src/main/java/com/archplanner/service/PlanningService.java": """package com.archplanner.service;

import com.archplanner.model.*;
import com.archplanner.repository.*;
import com.archplanner.service.engine.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class PlanningService {
    private final ProjectRepository projectRepository;
    private final FloorPlanRepository floorPlanRepository;
    private final CostEstimateRepository costEstimateRepository;
    private final SpatialEngine spatialEngine;
    private final ValidationEngine validationEngine;
    private final CostEngine costEngine;

    public PlanningService(ProjectRepository projectRepository, FloorPlanRepository floorPlanRepository, CostEstimateRepository costEstimateRepository, SpatialEngine spatialEngine, ValidationEngine validationEngine, CostEngine costEngine) {
        this.projectRepository = projectRepository;
        this.floorPlanRepository = floorPlanRepository;
        this.costEstimateRepository = costEstimateRepository;
        this.spatialEngine = spatialEngine;
        this.validationEngine = validationEngine;
        this.costEngine = costEngine;
    }

    @Transactional
    public FloorPlan generatePlan(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        
        List<com.archplanner.dto.RoomSpec> specs = new ArrayList<>();
        if(project.rooms != null) {
            for(Room r : project.rooms) {
                com.archplanner.dto.RoomSpec rs = new com.archplanner.dto.RoomSpec();
                rs.type = r.type;
                rs.name = r.name;
                rs.minArea = r.minArea;
                rs.priority = r.priority;
                rs.required = r.required;
                rs.quantity = r.quantity;
                specs.add(rs);
            }
        }
        
        List<com.archplanner.dto.RelationshipSpec> rels = new ArrayList<>();
        if(project.relationships != null) {
            for(RoomRelationship rr : project.relationships) {
                com.archplanner.dto.RelationshipSpec rel = new com.archplanner.dto.RelationshipSpec();
                rel.fromRoomType = rr.fromRoomType;
                rel.toRoomType = rr.toRoomType;
                rel.relationshipType = rr.relationshipType;
                rel.priority = rr.priority;
                rels.add(rel);
            }
        }
        
        int totalFloors = 2; // Default for now
        List<Room> generatedRooms = spatialEngine.generateLayout(project.plot, specs, rels, totalFloors);
        
        FloorPlan plan = new FloorPlan();
        plan.projectId = projectId;
        plan.generatedAt = LocalDateTime.now();
        plan.totalFloors = totalFloors;
        plan.status = "GENERATED";
        
        double totalBuiltUpArea = 0;
        for (Room r : generatedRooms) {
            totalBuiltUpArea += r.area;
        }
        plan.totalBuiltUpArea = totalBuiltUpArea;
        
        List<ValidationResult> validations = validationEngine.validate(project.plot, plan, generatedRooms, project.relationships);
        plan.validationResults = validations;
        
        double score = 100.0;
        long errs = validations.stream().filter(v -> v.severity.equals("ERROR")).count();
        score -= (errs * 10);
        plan.validationScore = Math.max(0, score);
        
        plan.rooms = generatedRooms;
        
        FloorPlan savedPlan = floorPlanRepository.save(plan);
        
        CostEstimate cost = costEngine.calculate(totalBuiltUpArea, totalFloors, "STANDARD");
        cost.floorPlanId = savedPlan.id;
        costEstimateRepository.save(cost);
        
        return savedPlan;
    }

    public FloorPlan getLatestPlan(Long projectId) {
        List<FloorPlan> plans = floorPlanRepository.findByProjectIdOrderByIdDesc(projectId);
        if (plans.isEmpty()) return null;
        return plans.get(0);
    }
    
    @Transactional
    public FloorPlan optimizePlan(Long projectId) {
        return generatePlan(projectId);
    }
}""",
    "src/main/java/com/archplanner/service/engine/SpatialEngine.java": """package com.archplanner.service.engine;

import com.archplanner.model.Plot;
import com.archplanner.model.Room;
import com.archplanner.dto.RoomSpec;
import com.archplanner.dto.RelationshipSpec;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class SpatialEngine {
    
    public List<Room> generateLayout(Plot plot, List<RoomSpec> roomSpecs, List<RelationshipSpec> relationships, int totalFloors) {
        List<Room> rooms = new ArrayList<>();
        double buildableWidth = plot.width - plot.leftSetback - plot.rightSetback;
        double buildableDepth = plot.depth - plot.frontSetback - plot.rearSetback;
        double originX = plot.leftSetback;
        double originY = plot.frontSetback;
        
        List<RoomSpec> groundFloorSpecs = new ArrayList<>();
        List<RoomSpec> upperFloorSpecs = new ArrayList<>();
        
        for (RoomSpec spec : roomSpecs) {
            String t = spec.type != null ? spec.type : "BEDROOM";
            if (t.equals("LIVING") || t.equals("DINING") || t.equals("KITCHEN") || t.equals("PARKING") 
                || t.equals("STAIRCASE") || t.equals("UTILITY") || t.equals("POOJA") || t.equals("STORE")) {
                groundFloorSpecs.add(spec);
            } else {
                upperFloorSpecs.add(spec);
            }
        }
        
        placeFloor(0, groundFloorSpecs, buildableWidth, buildableDepth, originX, originY, rooms);
        placeFloor(1, upperFloorSpecs, buildableWidth, buildableDepth, originX, originY, rooms);
        
        return rooms;
    }
    
    private void placeFloor(int floor, List<RoomSpec> specs, double buildWidth, double buildDepth, double oX, double oY, List<Room> output) {
        if (specs.isEmpty()) return;
        int numRows = (int) Math.ceil(Math.sqrt(specs.size()));
        double rowHeight = buildDepth / numRows;
        
        int specIdx = 0;
        for (int r = 0; r < numRows; r++) {
            int roomsInRow = (int) Math.ceil((double)(specs.size() - specIdx) / (numRows - r));
            if (roomsInRow == 0) break;
            
            double roomWidth = buildWidth / roomsInRow;
            for (int c = 0; c < roomsInRow; c++) {
                RoomSpec s = specs.get(specIdx++);
                Room rm = new Room();
                rm.type = s.type;
                rm.name = s.name;
                rm.floor = floor;
                rm.x = oX + (c * roomWidth);
                rm.y = oY + (r * rowHeight);
                rm.width = roomWidth;
                rm.height = rowHeight;
                rm.area = roomWidth * rowHeight;
                rm.minArea = s.minArea > 0 ? s.minArea : 100;
                rm.priority = s.priority;
                rm.required = s.required;
                rm.quantity = s.quantity;
                output.add(rm);
                if (specIdx >= specs.size()) break;
            }
        }
    }
}""",
    "src/main/java/com/archplanner/service/engine/ValidationEngine.java": """package com.archplanner.service.engine;

import com.archplanner.model.Plot;
import com.archplanner.model.FloorPlan;
import com.archplanner.model.Room;
import com.archplanner.model.RoomRelationship;
import com.archplanner.model.ValidationResult;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class ValidationEngine {
    
    public List<ValidationResult> validate(Plot plot, FloorPlan plan, List<Room> rooms, List<RoomRelationship> relationships) {
        List<ValidationResult> results = new ArrayList<>();
        
        if (plot.width * plot.depth <= 0) {
            ValidationResult v = new ValidationResult();
            v.severity = "ERROR";
            v.category = "PLOT";
            v.message = "Plot area is invalid.";
            v.suggestedFix = "Set positive width and depth.";
            results.add(v);
        }
        
        for (Room r : rooms) {
            if (r.x < plot.leftSetback || r.x + r.width > plot.width - plot.rightSetback ||
                r.y < plot.frontSetback || r.y + r.height > plot.depth - plot.rearSetback) {
                ValidationResult v = new ValidationResult();
                v.severity = "ERROR";
                v.category = "BOUNDARY";
                v.message = "Room " + r.name + " is outside buildable bounds.";
                v.affectedRooms = r.name;
                v.suggestedFix = "Resize or reposition room to fit setbacks.";
                results.add(v);
            }
            if (r.area < r.minArea) {
                ValidationResult v = new ValidationResult();
                v.severity = "WARNING";
                v.category = "AREA";
                v.message = "Room " + r.name + " is smaller than minimum required area.";
                v.affectedRooms = r.name;
                v.suggestedFix = "Increase room size.";
                results.add(v);
            }
            if (r.width < 6 || r.height < 6) {
                ValidationResult v = new ValidationResult();
                v.severity = "WARNING";
                v.category = "DIMENSION";
                v.message = "Room " + r.name + " has a dimension smaller than 6ft.";
                v.affectedRooms = r.name;
                v.suggestedFix = "Adjust room aspect ratio.";
                results.add(v);
            }
        }
        
        for (int i = 0; i < rooms.size(); i++) {
            for (int j = i + 1; j < rooms.size(); j++) {
                Room r1 = rooms.get(i);
                Room r2 = rooms.get(j);
                if (r1.floor == r2.floor) {
                    if (r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
                        r1.y < r2.y + r2.height && r1.y + r1.height > r2.y) {
                        ValidationResult v = new ValidationResult();
                        v.severity = "ERROR";
                        v.category = "OVERLAP";
                        v.message = "Rooms " + r1.name + " and " + r2.name + " overlap.";
                        v.affectedRooms = r1.name + "," + r2.name;
                        v.suggestedFix = "Separate rooms.";
                        results.add(v);
                    }
                }
            }
        }
        
        if (results.isEmpty()) {
            ValidationResult v = new ValidationResult();
            v.severity = "SUCCESS";
            v.category = "GENERAL";
            v.message = "All spatial constraints met.";
            results.add(v);
        }
        
        return results;
    }
}""",
    "src/main/java/com/archplanner/service/engine/CostEngine.java": """package com.archplanner.service.engine;

import com.archplanner.model.CostEstimate;
import org.springframework.stereotype.Service;

@Service
public class CostEngine {
    
    public CostEstimate calculate(double builtUpArea, int floors, String finishQuality) {
        double baseRate = 2100;
        double finishMultiplier = 1.0;
        if ("ECONOMY".equals(finishQuality)) finishMultiplier = 0.7;
        else if ("PREMIUM".equals(finishQuality)) finishMultiplier = 1.5;
        else if ("LUXURY".equals(finishQuality)) finishMultiplier = 2.0;
        
        double totalCost = builtUpArea * baseRate * finishMultiplier;
        
        CostEstimate est = new CostEstimate();
        est.builtUpArea = builtUpArea;
        est.ratePerSqFt = baseRate * finishMultiplier;
        est.totalCost = totalCost;
        est.structureCost = totalCost * 0.40;
        est.flooringCost = totalCost * 0.15;
        est.electricalCost = totalCost * 0.10;
        est.plumbingCost = totalCost * 0.10;
        est.finishesCost = totalCost * 0.25;
        est.finishQuality = finishQuality;
        
        return est;
    }
}""",
    "src/main/java/com/archplanner/service/ai/AIService.java": """package com.archplanner.service.ai;

import com.archplanner.dto.InterpretResponse;
import com.archplanner.dto.ChatResponse;

public interface AIService {
    InterpretResponse interpret(String naturalLanguageInput);
    ChatResponse chat(String message, String planContext);
    boolean isAvailable();
}""",
    "src/main/java/com/archplanner/service/ai/FallbackAIService.java": """package com.archplanner.service.ai;

import com.archplanner.dto.InterpretResponse;
import com.archplanner.dto.ChatResponse;
import org.springframework.stereotype.Service;

@Service("fallbackAIService")
public class FallbackAIService implements AIService {
    @Override
    public InterpretResponse interpret(String naturalLanguageInput) {
        InterpretResponse res = new InterpretResponse();
        res.fallbackMode = true;
        res.floors = 1;
        return res;
    }

    @Override
    public ChatResponse chat(String message, String planContext) {
        ChatResponse res = new ChatResponse();
        res.response = "I am operating in fallback mode. I understood: " + message;
        res.fallbackMode = true;
        return res;
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}""",
    "src/main/java/com/archplanner/service/ai/GeminiAIService.java": """package com.archplanner.service.ai;

import com.archplanner.dto.InterpretResponse;
import com.archplanner.dto.ChatResponse;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;

@Service
@Primary
public class GeminiAIService implements AIService {
    
    private final FallbackAIService fallback;
    
    public GeminiAIService(FallbackAIService fallback) {
        this.fallback = fallback;
    }

    @Override
    public InterpretResponse interpret(String naturalLanguageInput) {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.isEmpty()) return fallback.interpret(naturalLanguageInput);
        
        try {
            InterpretResponse res = new InterpretResponse();
            res.fallbackMode = false;
            return res;
        } catch (Exception e) {
            return fallback.interpret(naturalLanguageInput);
        }
    }

    @Override
    public ChatResponse chat(String message, String planContext) {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.isEmpty()) return fallback.chat(message, planContext);
        
        try {
            ChatResponse res = new ChatResponse();
            res.response = "AI Response to: " + message;
            res.fallbackMode = false;
            return res;
        } catch (Exception e) {
            return fallback.chat(message, planContext);
        }
    }

    @Override
    public boolean isAvailable() {
        String key = System.getenv("GEMINI_API_KEY");
        return key != null && !key.isEmpty();
    }
}""",
    "src/main/java/com/archplanner/controller/ProjectController.java": """package com.archplanner.controller;

import com.archplanner.model.*;
import com.archplanner.dto.*;
import com.archplanner.repository.*;
import com.archplanner.service.PlanningService;
import com.archplanner.service.ai.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final PlanningService planningService;
    private final AIService aiService;
    private final CostEstimateRepository costEstimateRepository;
    private final RoomRepository roomRepository;
    private final ValidationResultRepository validationResultRepository;

    public ProjectController(ProjectRepository projectRepository, PlanningService planningService, AIService aiService, CostEstimateRepository costEstimateRepository, RoomRepository roomRepository, ValidationResultRepository validationResultRepository) {
        this.projectRepository = projectRepository;
        this.planningService = planningService;
        this.aiService = aiService;
        this.costEstimateRepository = costEstimateRepository;
        this.roomRepository = roomRepository;
        this.validationResultRepository = validationResultRepository;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody CreateProjectRequest req) {
        try {
            Project p = new Project();
            p.name = req.projectName;
            p.createdAt = LocalDateTime.now();
            p.updatedAt = LocalDateTime.now();
            
            if (req.plot != null) {
                Plot plot = new Plot();
                plot.width = req.plot.width;
                plot.depth = req.plot.depth;
                plot.unit = req.plot.unit;
                plot.orientation = req.plot.orientation;
                plot.roadSide = req.plot.roadSide;
                plot.frontSetback = req.plot.frontSetback;
                plot.rearSetback = req.plot.rearSetback;
                plot.leftSetback = req.plot.leftSetback;
                plot.rightSetback = req.plot.rightSetback;
                plot.project = p;
                p.plot = plot;
            }
            
            p.rooms = new ArrayList<>();
            if (req.rooms != null) {
                for (RoomSpec rs : req.rooms) {
                    Room r = new Room();
                    r.type = rs.type;
                    r.name = rs.name;
                    r.minArea = rs.minArea;
                    r.priority = rs.priority;
                    r.required = rs.required;
                    r.quantity = rs.quantity;
                    p.rooms.add(r);
                }
            }
            
            p.relationships = new ArrayList<>();
            if (req.relationships != null) {
                for (RelationshipSpec rs : req.relationships) {
                    RoomRelationship rr = new RoomRelationship();
                    rr.fromRoomType = rs.fromRoomType;
                    rr.toRoomType = rs.toRoomType;
                    rr.relationshipType = rs.relationshipType;
                    rr.priority = rs.priority;
                    p.relationships.add(rr);
                }
            }
            
            Project saved = projectRepository.save(p);
            
            ProjectResponse res = new ProjectResponse();
            res.id = saved.id;
            res.name = saved.name;
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/interpret")
    public ResponseEntity<InterpretResponse> interpret(@PathVariable Long id, @RequestBody InterpretRequest req) {
        try {
            return ResponseEntity.ok(aiService.interpret(req.naturalLanguageInput));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/generate-plan")
    public ResponseEntity<PlanResponse> generatePlan(@PathVariable Long id) {
        try {
            FloorPlan plan = planningService.generatePlan(id);
            PlanResponse res = new PlanResponse();
            res.planId = plan.id;
            res.projectId = plan.projectId;
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/plan")
    public ResponseEntity<PlanResponse> getPlan(@PathVariable Long id) {
        try {
            FloorPlan plan = planningService.getLatestPlan(id);
            if (plan == null) return ResponseEntity.notFound().build();
            PlanResponse res = new PlanResponse();
            res.planId = plan.id;
            res.projectId = plan.projectId;
            res.totalFloors = plan.totalFloors;
            res.totalBuiltUpArea = plan.totalBuiltUpArea;
            res.validationScore = plan.validationScore;
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validatePlan(@PathVariable Long id) {
        try {
            FloorPlan plan = planningService.getLatestPlan(id);
            if (plan == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(plan.validationResults);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/cost")
    public ResponseEntity<CostEstimate> getCost(@PathVariable Long id) {
        try {
            FloorPlan plan = planningService.getLatestPlan(id);
            if (plan == null) return ResponseEntity.notFound().build();
            return costEstimateRepository.findByFloorPlanId(plan.id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/ai-chat")
    public ResponseEntity<ChatResponse> aiChat(@PathVariable Long id, @RequestBody ChatRequest req) {
        try {
            return ResponseEntity.ok(aiService.chat(req.message, "Context about plan " + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/floors/{floor}")
    public ResponseEntity<List<Room>> getRoomsForFloor(@PathVariable Long id, @PathVariable int floor) {
        try {
            FloorPlan plan = planningService.getLatestPlan(id);
            if (plan == null) return ResponseEntity.notFound().build();
            List<Room> all = roomRepository.findByFloorPlanId(plan.id);
            List<Room> floorRooms = new ArrayList<>();
            for (Room r : all) {
                if (r.floor == floor) floorRooms.add(r);
            }
            return ResponseEntity.ok(floorRooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/optimize")
    public ResponseEntity<PlanResponse> optimizePlan(@PathVariable Long id) {
        try {
            FloorPlan plan = planningService.optimizePlan(id);
            PlanResponse res = new PlanResponse();
            res.planId = plan.id;
            res.projectId = plan.projectId;
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}""",
    ".env.example": """GEMINI_API_KEY=your_gemini_api_key_here"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
print("All files generated successfully!")
