package com.archplanner.service.ai;

import com.archplanner.dto.InterpretResponse;
import com.archplanner.dto.ChatResponse;
import org.springframework.stereotype.Service;

@Service("fallbackAIService")
public class FallbackAIService implements AIService {
    @Override
    public InterpretResponse interpret(String naturalLanguageInput) {
        InterpretResponse res = new InterpretResponse();
        res.fallbackMode = true;
        res.floors = 1;
        return res;
    }

    @Override
    public ChatResponse chat(String message, String planContext) {
        ChatResponse res = new ChatResponse();
        res.response = "I am operating in fallback mode. I understood: " + message;
        res.fallbackMode = true;
        return res;
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}