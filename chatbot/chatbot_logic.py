def detect_category(text):
    """
    Detect the complaint category based on keywords in user input.
    
    Args:
        text (str): User input text
        
    Returns:
        str: Detected category of complaint
    """
    text = text.lower().strip()
    
    # Cyber Fraud keywords
    cyber_keywords = ["scam", "fraud", "online", "phishing", "malware", "cyber", "hacking", "bitcoin", "cryptocurrency"]
    if any(keyword in text for keyword in cyber_keywords):
        return "Cyber Fraud"
    
    # Harassment keywords
    harassment_keywords = ["harassment", "abusive", "threatening", "stalking", "bullying", "threatening messages", "unwanted contact"]
    if any(keyword in text for keyword in harassment_keywords):
        return "Harassment"
    
    # Domestic Violence keywords
    dv_keywords = ["domestic", "violence", "abuse", "beating", "spouse", "family", "home abuse"]
    if any(keyword in text for keyword in dv_keywords):
        return "Domestic Violence"
    
    # Theft keywords
    theft_keywords = ["theft", "stolen", "robbery", "burglary", "stealing", "missing", "robbed"]
    if any(keyword in text for keyword in theft_keywords):
        return "Theft"
    
    return "General Complaint"


def generate_response(category):
    """
    Generate legal advice and guidance based on complaint category.
    
    Args:
        category (str): Type of complaint/crime
        
    Returns:
        dict: Legal section, advice, and escalation path
    """
    responses = {
        "Cyber Fraud": {
            "section": "IT Act 66C, IPC 420",
            "advice": "File complaint at nearest Cyber Cell immediately. Preserve all digital evidence (screenshots, links, transaction records).",
            "escalation": "If FIR not registered within 7 days, escalate to SP."
        },
        "Harassment": {
            "section": "IPC 354, 354A, 354D",
            "advice": "File FIR at nearest police station. Keep records of all harassment incidents with dates and times.",
            "escalation": "If ignored, escalate legally or approach Women's Commission."
        },
        "Domestic Violence": {
            "section": "Protection of Women from Domestic Violence Act, IPC 498A",
            "advice": "Contact Women Helpline (1091) or Protection Officer. File petition under DV Act.",
            "escalation": "Approach Magistrate if no action taken. Seek temporary restraining orders."
        },
        "Theft": {
            "section": "IPC 378, 379",
            "advice": "File theft complaint immediately at nearest police station with detailed description and item value.",
            "escalation": "Escalate to SP if FIR delayed. Consider civil suit for recovery."
        },
        "General Complaint": {
            "section": "To be determined",
            "advice": "Consult nearest police station or legal advisor for guidance.",
            "escalation": "Seek legal advice if no response within 30 days."
        }
    }
    
    return responses.get(category, responses["General Complaint"])


def chatbot_response(user_input):
    """
    Process user input and return comprehensive legal guidance.
    
    Args:
        user_input (str): User's complaint or problem description
        
    Returns:
        dict: Categorized response with legal guidance
    """
    if not user_input or not user_input.strip():
        return {
            "category": "Invalid Input",
            "section": "N/A",
            "advice": "Please describe your issue clearly.",
            "escalation": "N/A"
        }
    
    category = detect_category(user_input)
    response_data = generate_response(category)

    return {
        "category": category,
        "section": response_data["section"],
        "advice": response_data["advice"],
        "escalation": response_data["escalation"]
    }


if __name__ == "__main__":
    user_text = input("Enter your problem: ").strip()
    result = chatbot_response(user_text)
    
    print("\n" + "="*60)
    print(f"Category: {result['category']}")
    print(f"Legal Section: {result['section']}")
    print(f"Advice: {result['advice']}")
    print(f"Escalation Path: {result['escalation']}")
    print("="*60)