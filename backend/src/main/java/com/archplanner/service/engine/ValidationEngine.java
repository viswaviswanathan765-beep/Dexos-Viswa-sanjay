package com.archplanner.service.engine;

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
}