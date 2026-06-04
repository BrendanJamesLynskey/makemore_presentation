# makemore

**An interactive, slide-by-slide walkthrough of Andrej Karpathy's [makemore](https://github.com/karpathy/makemore) — an autoregressive character-level language model that "makes more of things".**

Trained on ~32K names, makemore is the spine of the early "Neural Networks: Zero to Hero" videos. This deck traces the progression from a bigram counting model, to a Bengio-2003 MLP, through the initialisation/BatchNorm deep-dive, and on to a WaveNet-style hierarchical model.

---

## [Launch Presentation](https://brendanjameslynskey.github.io/makemore_presentation/)

---

## What's Covered

| Part | Topic |
|------|-------|
| 1 | **The Problem & the Data** — names.txt (~32K names), a 27-character vocabulary with a special `.` start/end token, and the autoregressive goal |
| 2 | **The Bigram Model** — counting bigrams into a 27×27 matrix, row-normalising to probabilities, sampling with `torch.multinomial`, NLL loss and +1 smoothing |
| 3 | **The Bigram as a Neural Net** — one-hot inputs × a 27×27 weight matrix, softmax, cross-entropy = NLL, and training `W` by gradient descent to recover the counts |
| 4 | **The MLP (Bengio 2003)** — an embedding table, a `block_size` context window, a hidden tanh layer, minibatching, learning-rate finding, and train/dev/test splits |
| 5 | **Making It Train Well** — the "hockey stick" loss, tanh saturation, kaiming-ish initialisation, and BatchNorm with its train/eval running statistics |
| 6 | **Going Deeper: WaveNet** — `FlattenConsecutive` hierarchical fusion and a `torch.nn`-like module API (Linear, BatchNorm1d, Tanh, Embedding, Sequential) built by hand |

The presentation closes with a summary grid, a live bigram name sampler, a "where this fits in Zero-to-Hero" context table, and key takeaways.

## Format

Built with [Reveal.js](https://revealjs.com/). Use `→` to advance, `↓` for sub-sections, and `Esc` for the slide overview. Includes an interactive vocabulary encoder, a hoverable bigram probability heatmap, and a live bigram name sampler that draws characters with `torch.multinomial`-style sampling.

## Part of

This project is part of [Karpathy: Neural Networks Zero to Hero](https://github.com/BrendanJamesLynskey/LLM_Hub_Karpathy_Zero_to_Hero), itself part of the [LLMs](https://github.com/BrendanJamesLynskey/LLMs) hub — a set of interactive resources covering transformer internals, agent architectures, CUDA programming, and more.

Credits: Andrej Karpathy's [makemore](https://github.com/karpathy/makemore) repository and the [Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ) playlist.
