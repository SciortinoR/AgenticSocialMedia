"""
AI Service for content generation
File: backend/app/services/ai_service.py

Handles AI-powered content generation for agents using Groq LLM.
Falls back to mock implementation if USE_MOCK_AI=true or no API key configured.
"""

import random
import os
from typing import Dict, Any, List, Optional
from app.core.config import settings


class AIService:
    """Service for AI-powered content generation"""

    def __init__(self):
        # Check if we should use mock mode
        self.use_mock = settings.use_mock_ai

        # Initialize Groq client if not in mock mode
        if not self.use_mock:
            groq_api_key = settings.groq_api_key
            if groq_api_key:
                try:
                    from groq import Groq
                    self.groq_client = Groq(api_key=groq_api_key)
                    self.model = settings.groq_model
                    print(f"✅ Groq AI initialized with model: {self.model}")
                except ImportError:
                    print("⚠️  Groq package not installed. Run: pip install groq")
                    print("⚠️  Falling back to mock mode")
                    self.use_mock = True
                except Exception as e:
                    print(f"⚠️  Failed to initialize Groq: {e}")
                    print("⚠️  Falling back to mock mode")
                    self.use_mock = True
            else:
                print("⚠️  GROQ_API_KEY not set. Using mock mode.")
                print("⚠️  Sign up at groq.com for free API key (no credit card required)")
                self.use_mock = True

    async def generate_post_content(
        self,
        agent_config: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate post content based on agent configuration

        Args:
            agent_config: Agent configuration including system_prompt, preferences, etc.
            context: Optional context for content generation

        Returns:
            Generated post content
        """
        if self.use_mock:
            return self._mock_generate_content(agent_config, context)

        try:
            # Build prompt from agent config
            system_prompt = agent_config.get("system_prompt", "You are a helpful social media assistant.")
            personality_data = agent_config.get("personality_data", {})

            # Extract communication style and topics
            communication_style = personality_data.get("communication_style", "casual")
            topics = personality_data.get("topics_of_interest", ["general topics"])

            # Randomly select a post type for variety
            post_types = [
                "Share an interesting thought or observation",
                "Ask an engaging question",
                "Share a recent learning or discovery",
                "Express an opinion on a current trend",
                "Share a personal experience or story",
                "Offer helpful advice or tips",
                "React to something interesting you noticed",
                "Start a discussion about an idea"
            ]
            post_type = random.choice(post_types)

            # Build varied user prompt
            user_prompt = f"""Generate a social media post. Keep it under 200 characters.

Post type: {post_type}
Communication style: {communication_style}
Topics you care about: {', '.join(topics) if topics else 'general topics'}

Guidelines:
- Be authentic and natural
- Match the communication style
- Don't use hashtags unless style is friendly
- Make it engaging and conversational
- Vary your sentence structure and opening
- Each post should feel unique and spontaneous
"""

            # Call Groq API with higher temperature for more creativity
            response = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model,
                temperature=1.0,
                max_tokens=200,
                top_p=0.95
            )

            content = response.choices[0].message.content.strip()

            # Remove quotes if the model wrapped the response in quotes
            if content.startswith('"') and content.endswith('"'):
                content = content[1:-1]
            if content.startswith("'") and content.endswith("'"):
                content = content[1:-1]

            return content

        except Exception as e:
            print(f"⚠️  Groq API error: {e}")
            print("⚠️  Falling back to mock content")
            return self._mock_generate_content(agent_config, context)

    async def suggest_response(
        self,
        original_content: str,
        agent_config: Dict[str, Any]
    ) -> str:
        """
        Suggest a response to content

        Args:
            original_content: Content to respond to
            agent_config: Agent configuration

        Returns:
            Suggested response
        """
        if self.use_mock:
            return self._mock_suggest_response(original_content, agent_config)

        try:
            system_prompt = agent_config.get("system_prompt", "You are a helpful social media assistant.")
            personality_data = agent_config.get("personality_data", {})
            communication_style = personality_data.get("communication_style", "casual")

            user_prompt = f"""Generate a short, natural comment response to this post:

"{original_content}"

Communication style: {communication_style}

Guidelines:
- Keep it very brief (under 100 characters)
- Be authentic and conversational
- Match the communication style
- Don't use hashtags
"""

            response = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=100,
                top_p=0.9
            )

            content = response.choices[0].message.content.strip()

            # Remove quotes if wrapped
            if content.startswith('"') and content.endswith('"'):
                content = content[1:-1]
            if content.startswith("'") and content.endswith("'"):
                content = content[1:-1]

            return content

        except Exception as e:
            print(f"⚠️  Groq API error: {e}")
            print("⚠️  Falling back to mock response")
            return self._mock_suggest_response(original_content, agent_config)

    def _mock_generate_content(
        self,
        agent_config: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Mock content generation for development"""
        topics = agent_config.get("personality_data", {}).get("topics_of_interest", [])
        communication_style = agent_config.get("personality_data", {}).get("communication_style", "casual")

        if not topics:
            topics = ["technology", "productivity", "innovation"]

        topic = random.choice(topics)

        # Style-specific templates
        if communication_style == "professional":
            templates = [
                f"Excited to share insights on {topic}. Key takeaways from recent industry developments.",
                f"Reflecting on the evolution of {topic} and its impact on modern practices.",
                f"Important considerations when approaching {topic} in today's landscape.",
            ]
        elif communication_style == "friendly":
            templates = [
                f"Hey everyone! 👋 Been thinking a lot about {topic} lately and wanted to share some thoughts!",
                f"Can we talk about how amazing {topic} is? Seriously loving this space right now! 🚀",
                f"Quick thought on {topic}: It's fascinating how this continues to evolve!",
            ]
        else:  # casual
            templates = [
                f"Interesting developments in {topic} lately. What are your thoughts?",
                f"Been exploring {topic} and found some cool insights worth sharing.",
                f"Quick take on {topic}: The landscape is changing fast.",
            ]

        return random.choice(templates)

    def _mock_suggest_response(
        self,
        original_content: str,
        agent_config: Dict[str, Any]
    ) -> str:
        """Mock response suggestion"""
        communication_style = agent_config.get("personality_data", {}).get("communication_style", "casual")

        if communication_style == "professional":
            responses = [
                "Excellent point. I've observed similar patterns in recent analyses.",
                "Thank you for sharing this perspective. It aligns with current industry trends.",
                "Valuable insight. This warrants further discussion.",
            ]
        elif communication_style == "friendly":
            responses = [
                "Love this! 🎉 Thanks for sharing!",
                "This is so great! Really appreciate you posting this!",
                "Absolutely agree! Thanks for bringing this up! 💯",
            ]
        else:  # casual
            responses = [
                "Great point! Thanks for sharing.",
                "Interesting take. Agree with this.",
                "Good stuff. Thanks for posting.",
            ]

        return random.choice(responses)

    async def analyze_engagement(
        self,
        content: str,
        engagement_metrics: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Analyze content engagement for learning

        Args:
            content: Post content
            engagement_metrics: Likes, comments, etc.

        Returns:
            Analysis results
        """
        # Simple scoring based on engagement
        total_engagement = sum(engagement_metrics.values())

        if total_engagement > 50:
            score = "high"
        elif total_engagement > 10:
            score = "medium"
        else:
            score = "low"

        return {
            "engagement_score": total_engagement,
            "engagement_level": score,
            "insights": f"Content received {score} engagement with {total_engagement} total interactions."
        }


# Singleton instance
ai_service = AIService()
