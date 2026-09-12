package com.archplanner.service.engine;

import com.archplanner.model.Plot;
import com.archplanner.model.Room;
import com.archplanner.dto.RoomSpec;
import com.archplanner.dto.RelationshipSpec;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class SpatialEngine {
    
    public List<Room> generateLayout(Plot plot, List<RoomSpec> roomSpecs, List<RelationshipSpec> relationships, int totalFloors) {
        List<Room> rooms = new ArrayList<>();
        double buildableWidth = plot.width - plot.leftSetback - plot.rightSetback;
        double buildableDepth = plot.depth - plot.frontSetback - plot.rearSetback;
        double originX = plot.leftSetback;
        double originY = plot.frontSetback;
        
        List<RoomSpec> groundFloorSpecs = new ArrayList<>();
        List<RoomSpec> upperFloorSpecs = new ArrayList<>();
        
        for (RoomSpec spec : roomSpecs) {
            String t = spec.type != null ? spec.type : "BEDROOM";
            if (t.equals("LIVING") || t.equals("DINING") || t.equals("KITCHEN") || t.equals("PARKING") 
                || t.equals("STAIRCASE") || t.equals("UTILITY") || t.equals("POOJA") || t.equals("STORE")) {
                groundFloorSpecs.add(spec);
            } else {
                upperFloorSpecs.add(spec);
            }
        }
        
        placeFloor(0, groundFloorSpecs, buildableWidth, buildableDepth, originX, originY, rooms);
        placeFloor(1, upperFloorSpecs, buildableWidth, buildableDepth, originX, originY, rooms);
        
        return rooms;
    }
    
    private void placeFloor(int floor, List<RoomSpec> specs, double buildWidth, double buildDepth, double oX, double oY, List<Room> output) {
        if (specs.isEmpty()) return;
        int numRows = (int) Math.ceil(Math.sqrt(specs.size()));
        double rowHeight = buildDepth / numRows;
        
        int specIdx = 0;
        for (int r = 0; r < numRows; r++) {
            int roomsInRow = (int) Math.ceil((double)(specs.size() - specIdx) / (numRows - r));
            if (roomsInRow == 0) break;
            
            double roomWidth = buildWidth / roomsInRow;
            for (int c = 0; c < roomsInRow; c++) {
                RoomSpec s = specs.get(specIdx++);
                Room rm = new Room();
                rm.type = s.type;
                rm.name = s.name;
                rm.floor = floor;
                rm.x = oX + (c * roomWidth);
                rm.y = oY + (r * rowHeight);
                rm.width = roomWidth;
                rm.height = rowHeight;
                rm.area = roomWidth * rowHeight;
                rm.minArea = s.minArea > 0 ? s.minArea : 100;
                rm.priority = s.priority;
                rm.required = s.required;
                rm.quantity = s.quantity;
                output.add(rm);
                if (specIdx >= specs.size()) break;
            }
        }
    }
}