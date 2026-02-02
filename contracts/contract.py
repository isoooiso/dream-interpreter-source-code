# { "Depends": "py-genlayer:test" }

from genlayer import *
import hashlib
import json


class DreamInterpreter(gl.Contract):
    dreams: DynArray[str]
    interpretations: DynArray[str]
    scores: DynArray[u8]
    authors: DynArray[Address]
    max_gallery: u32

    last_score: TreeMap[Address, u8]
    last_interpretation: TreeMap[Address, str]

    def __init__(self):
        self.max_gallery = u32(20)

    @gl.public.write
    def interpret_dream(self, dream_text: str) -> bool:
        sender = gl.message.sender_address
        text = dream_text.strip()

        if len(text) < 10:
            raise Rollback("Dream is too short")
        if len(text) > 800:
            raise Rollback("Dream is too long")

        prompt = (
            "You are a dream interpreter and psychologist.\n"
            "Analyze the dream below and explain its possible meaning.\n"
            "Then rate how interesting or unusual the dream is.\n\n"
            "Return ONLY valid JSON:\n"
            '{ "interpretation": string (<= 300 chars), "score": integer 1..10 }\n\n'
            f"Dream:\n{text}\n"
        )

        task = "Interpret the dream"
        criteria = "JSON only. No markdown. No extra keys."

        try:
            raw = gl.eq_principle_prompt_non_comparative(
                lambda: prompt,
                task=task,
                criteria=criteria
            )
            data = json.loads(raw)
            interpretation = str(data.get("interpretation", "")).strip()
            score = int(data.get("score", 5))
        except Exception:
            h = hashlib.sha256((text + str(sender)).encode()).digest()
            score = int(h[0] % 4) + 6
            interpretation = "This dream reflects inner thoughts and emotional processing."

        if score < 1:
            score = 1
        if score > 10:
            score = 10
        if len(interpretation) > 300:
            interpretation = interpretation[:300]

        self.last_score[sender] = u8(score)
        self.last_interpretation[sender] = interpretation

        if score >= 8:
            self._save_to_gallery(text, interpretation, score, sender)

        return True

    def _save_to_gallery(self, dream, interp, score, author):
        if len(self.dreams) >= int(self.max_gallery):
            self.dreams.pop(0)
            self.interpretations.pop(0)
            self.scores.pop(0)
            self.authors.pop(0)

        self.dreams.append(dream)
        self.interpretations.append(interp)
        self.scores.append(u8(score))
        self.authors.append(author)

    @gl.public.view
    def get_last_result(self, user_address: str) -> str:
        try:
            addr = Address(user_address)
            score = int(self.last_score[addr])
            interp = self.last_interpretation[addr]
        except Exception:
            return json.dumps({ "score": 0, "interpretation": "", "saved": False })

        return json.dumps({
            "score": score,
            "interpretation": interp,
            "saved": score >= 8
        })

    @gl.public.view
    def get_gallery(self) -> str:
        result = []
        i = 0
        while i < len(self.dreams):
            result.append({
                "dream": self.dreams[i],
                "interpretation": self.interpretations[i],
                "score": int(self.scores[i]),
                "author": str(self.authors[i])
            })
            i += 1

        return json.dumps(result)
