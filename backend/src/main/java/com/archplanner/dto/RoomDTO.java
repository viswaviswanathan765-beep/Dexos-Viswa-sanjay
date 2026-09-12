package com.archplanner.dto;
import java.util.List;
public class RoomDTO {
    public Long id;
    public String type;
    public String name;
    public int floor;
    public double x;
    public double y;
    public double width;
    public double height;
    public double area;
    public List<DoorDTO> doors;
    public List<WindowDTO> windows;
}