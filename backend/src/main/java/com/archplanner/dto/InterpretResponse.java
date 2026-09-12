package com.archplanner.dto;
import java.util.List;
public class InterpretResponse {
    public PlotSpec plot;
    public int floors;
    public List<RoomSpec> rooms;
    public List<RelationshipSpec> relationships;
    public List<String> preferences;
    public List<String> warnings;
    public boolean fallbackMode;
}