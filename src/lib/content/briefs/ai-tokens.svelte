<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>Not letters, not words</h2>
<p>
	A language model works with numbers, so before it reads anything, a <strong>tokenizer</strong> chops the text into pieces and swaps each piece
	for a number from a fixed vocabulary. Those pieces are <strong>tokens</strong>. Common words like “the” are usually one token. Rarer words are
	split into parts, and an unusual name might be several tokens long.
</p>
<p>
	Why not letters? Sequences would be very long, and the model would spend its effort learning spelling. Why not whole words? The vocabulary
	would be endless, and new words would be impossible. Pieces in between keep the vocabulary to a manageable size while still covering any text.
</p>

<h2>A toy tokenizer</h2>
<p>
	Real tokenizers learn their vocabulary from huge amounts of text (a method called byte-pair encoding is common). This toy one uses a tiny
	hand-made vocabulary and always takes the longest piece it knows:
</p>

<Code
	lang="py"
	code={`vocab = {"straw", "berry", "st", "raw", "b", "e", "r", "y", "s", "t", "a", "w",
         "un", "believ", "able", "the", " ", "cat"}

def tokenize(text):
    tokens, i = [], 0
    while i < len(text):
        for j in range(len(text), i, -1):          # longest match first
            if text[i:j] in vocab:
                tokens.append(text[i:j])
                i = j
                break
        else:
            tokens.append(text[i])                 # unknown character: on its own
            i += 1
    return tokens

print(tokenize("strawberry"))     # ['straw', 'berry']
print(tokenize("unbelievable"))   # ['un', 'believ', 'able']
print(tokenize("the cat"))        # ['the', ' ', 'cat']`}
/>

<h2>Why the r’s are hard to count</h2>
<p>
	Ask a model how many r’s are in “strawberry” and it may get it wrong. In the toy above, the model would see two chunks, “straw” and “berry”, and
	never the individual letters. It has to have learned how each chunk is spelled. Spelling, counting letters, rhyming and reversing text are all
	harder for the same reason.
</p>

<h2>Tokens are the unit of everything</h2>
<ul>
	<li><strong>Price.</strong> AI APIs charge per token, usually per million, and output tokens often cost more than input tokens.</li>
	<li><strong>Length.</strong> A model’s context window, how much it can read at once, is measured in tokens.</li>
	<li><strong>Speed.</strong> Models write one token at a time, so the speed you see is tokens per second.</li>
</ul>
<p>
	As a rough rule for English, one token is about four characters, or three quarters of a word: 100 tokens is about 75 words. Code, numbers and
	many other languages often take more tokens for the same meaning, which makes them slower and more expensive to process.
</p>

<Note title="Count before you guess" tone="tip">
	Every major AI provider documents a way to count tokens for its models. Use it for real budgets; the four-characters rule is only for estimates.
</Note>

<h2>Why it matters to you</h2>
<p>
	Thinking in tokens explains costs, why long documents get cut off, and why models stumble on letter-level tasks. When you need exact spelling,
	counting or arithmetic, have the model write and run code, or do it in code yourself.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them" rel="external">OpenAI: What are tokens and how to count them</a></li>
	<li><a href="https://huggingface.co/learn/llm-course/chapter6/5" rel="external">Hugging Face: Byte-pair encoding tokenization</a></li>
</ul>
