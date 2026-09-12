package com.archplanner.model;

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
}