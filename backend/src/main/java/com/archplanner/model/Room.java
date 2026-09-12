package com.archplanner.model;

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
}