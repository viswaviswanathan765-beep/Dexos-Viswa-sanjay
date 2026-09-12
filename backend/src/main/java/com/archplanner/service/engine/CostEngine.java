package com.archplanner.service.engine;

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
}