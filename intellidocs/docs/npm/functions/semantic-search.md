---
sidebar_position: 2
---

# Semantic search

The SemanticSearch module offers scalable and efficient search capabilities by leveraging semantic understanding. It transforms text data into vector embeddings and employs cosine similarity to identify the most semantically related matches. 

The Intellinode SemanticSearch module offers two key features:
1. **Semantic Search**: This applies contextual search operations by converting documents into vectors and applying semantic understanding using multiple providers such as OpenAI and Cohere.

2. **Semantic Search Paging**: For larger datasets, apply the semantic search in iterations, comparing the top 'n' matches at a time. This ensures efficient memory usage.

## Semantic Search 
1. Start by importing the `SemanticSearch` from IntelliNode:

   ```javascript
   const { SemanticSearch } = require('intellinode');
   ```

2.  Specify the search variables:
- `pivotItem`: This term serves as the reference string in the search.
- `searchArray`: This is an array of items or phrases that the system will search through to find the best semantic matches to the pivot item.
- `numberOfMatches`: the number of top matches you want to get.

   ```javascript
   const pivotItem = 'Hello from OpenAI!';
   const searchArray = ['Greetings from OpenAI!', 'Bonjour de OpenAI!', 'Hola desde OpenAI!'];
   const numberOfMatches = 2;
   ```

3. Instantiate `SemanticSearch` with the desired model's API key and provider (**openai** or **cohere**): 

   ```javascript
   const apiKey = '<your-provider-key>'
   const provider = 'openai' // or 'cohere'
   const search = new SemanticSearch(apiKey, provider);
   ```

4. Call the `getTopMatches` function to get the scores of the array indices:

  ```javascript
   const results = await search.getTopMatches(pivotItem, searchArray, numberOfMatches);
   console.log('Semantic Search Results:', results);
  ```


6. To get only top matches content from the scores results you can use:

   ```javascript
   console.log('top matches:', search.filterTopMatches(results, searchArray));
   ```


## Semantic Search Pagination
For larger data sets, IntelliNode provides a SemanticSearchPaging feature. This allows memory-efficient semantic search by working in iterations and keeping the top 'n' matches.

1. Import the required `SemanticSearchPaging` and `SupportedEmbedModels` from IntelliNode:

   ```javascript
   const { SemanticSearchPaging, SupportedEmbedModels } = require('intellinode');
   ```
2. Instantiation of SemanticSearchPaging remains the same as above but takes the number of desired matches and the pivot item in the constructor:
- `pivotItem`: This term serves as the reference string in the search.
- `numberOfMatches`: the number of top matches you want to get.

   ```javascript
   const search = new SemanticSearchPaging(apiKey, provider, pivotItem, numberOfMatches);
   ```
3. You can add new arrays in your search memory using `addNewData` function:

   ```javascript
   // this is only a simulation of data load, in a real app you will have a loop on your data source provider.

   const searchArray1 = ['Greetings from IntelliNode!', 'Bonjour de IntelliNode!', '来自 IntelliNode 的问候！'];
   const searchArray2 = ['Saudações do IntelliNode!', 'Hola desde IntelliNode!', 'Groeten van IntelliNode!'];
   
   await search.addNewData(searchArray1);
   await search.addNewData(searchArray2);
   ```

4. Finally, to get your top matches, call `getCurrentTopMatches`:

   ```javascript
   const results = await search.getCurrentTopMatches();
   console.log('Semantic Search Results:', results);
   ```

- Output example, the score calculated using cosine similarity:

   ```sh
   [{ text: 'Greetings from IntelliNode!', score: 0.9966673636144003 },
   { text: 'Hola desde IntelliNode!', score: 0.9596313682845611 }]
   ```

Remember to wrap these functions inside an async function to handle promise returns properly.

Visit the following links to access sample codes:

- [Sample code for SemanticSearch](https://github.com/Barqawiz/IntelliNode/blob/main/samples/command_sample/test_semantic_search.js).
- [Sample code for SemanticSearchPaging](https://github.com/Barqawiz/IntelliNode/blob/main/samples/command_sample/test_semantic_search_pagination.js).
