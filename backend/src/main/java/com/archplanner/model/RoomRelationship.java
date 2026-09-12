package com.archplanner.model;

import jakarta.persistence.*;

@Entity
public class RoomRelationship {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long projectId;
    public String fromRoomType;
    public String toRoomType;
    public String relationshipType;
    public String priority;
}