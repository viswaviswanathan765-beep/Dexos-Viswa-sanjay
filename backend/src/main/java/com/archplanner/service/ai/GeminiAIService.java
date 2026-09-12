package com.archplanner.service.ai;

import com.archplanner.dto.InterpretResponse;
import com.archplanner.dto.ChatResponse;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;

@Service
@Primary
public class GeminiAIService implements AIService {
    
    private final FallbackAIService fallback;
    
    public GeminiAIService(FallbackAIService fallback) {
        this.fallback = fallback;
    }

    @Override
    public InterpretResponse interpret(String naturalLanguageInput) {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.isEmpty()) return fallback.interpret(naturalLanguageInput);
        
        try {
            InterpretResponse res = new InterpretResponse();
            res.fallbackMode = false;
            return res;
        } catch (Exception e) {
            return fallback.interpret(naturalLanguageInput);
        }
    }

    @Override
    public ChatResponse chat(String message, String planContext) {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.isEmpty()) return fallback.chat(message, planContext);
        
        try {
            ChatResponse res = new ChatResponse();
            res.response = "AI Response to: " + message;
            res.fallbackMode = false;
            return res;
        } catch (Exception e) {
            return fallback.chat(message, planContext);
        }
    }

    @Override
    public boolean isAvailable() {
        String key = System.getenv("GEMINI_API_KEY");
        return key != null && !key.isEmpty();
    }
}