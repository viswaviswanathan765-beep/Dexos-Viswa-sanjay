package com.archplanner.service;

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
}