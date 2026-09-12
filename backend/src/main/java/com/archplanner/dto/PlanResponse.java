package com.archplanner.dto;
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
}