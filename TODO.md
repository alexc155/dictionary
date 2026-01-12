# ToDo

1. Iterate through all entries pulling out the word and the plural
2. Build JS Sets of words
    a. Make a set for AAA, AAB, AAC = 17.5K sets
3. We want 128 folders each with 128 folders each with 128 files = 2M files
4. One file per word. Pad each word at end with _'s (value = 0)
5. Iterate through sets taking 128 words. At the next word, create new folder, rename existing folder to describe range
6. Add folder structure to meta object

Properties

* Length
* Types

Optional

* Common
* Plural
* Proper Noun

Indexes

* Length
* Type
* Plural
* Common
* Proper Noun
* Latin only
* Start Letter
* Unix dictionary
