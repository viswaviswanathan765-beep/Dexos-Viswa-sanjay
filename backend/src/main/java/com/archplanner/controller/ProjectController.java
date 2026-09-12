package com.archplanner.controller;

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
}