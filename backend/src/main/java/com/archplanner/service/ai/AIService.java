package com.archplanner.service.ai;

import com.archplanner.dto.InterpretResponse;
import com.archplanner.dto.ChatResponse;

public interface AIService {
    InterpretResponse interpret(String naturalLanguageInput);
    ChatResponse chat(String message, String planContext);
    boolean isAvailable();
}