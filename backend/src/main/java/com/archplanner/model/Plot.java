package com.archplanner.model;

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
}