package com.archplanner.model;

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
}