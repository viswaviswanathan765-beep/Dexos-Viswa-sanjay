package com.archplanner.model;

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
}