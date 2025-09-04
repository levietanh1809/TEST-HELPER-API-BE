// Test script for new GPT-4.1 models
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testNewModels() {
  console.log('🧪 Testing new GPT-4.1 models...\n');

  try {
    // Test 1: Get conversion options
    console.log('📋 Testing /options endpoint...');
    const optionsResponse = await fetch(`${BASE_URL}/api/images/figma-to-code/options`);
    const options = await optionsResponse.json();
    
    if (options.success) {
      console.log('✅ Options endpoint working');
      
      // Check if new models are included
      const models = options.data.models;
      const newModels = ['gpt-4.1', 'gpt-4.1-mini'];
      
      newModels.forEach(model => {
        if (models.includes(model)) {
          console.log(`✅ ${model} found in models list`);
        } else {
          console.log(`❌ ${model} NOT found in models list`);
        }
      });
      
      // Check model info
      const modelInfo = options.data.modelInfo;
      const newModelInfo = modelInfo.filter(info => newModels.includes(info.model));
      
      console.log('\n📊 New Model Information:');
      newModelInfo.forEach(info => {
        console.log(`\n🔹 ${info.model}:`);
        console.log(`   Description: ${info.description}`);
        console.log(`   Max Tokens: ${info.maxTokens.toLocaleString()}`);
        console.log(`   Category: ${info.category}`);
        console.log(`   Input Cost: $${info.costPer1K.input}/1K tokens`);
        console.log(`   Output Cost: $${info.costPer1K.output}/1K tokens`);
        console.log(`   Features: ${info.features.join(', ')}`);
        console.log(`   Recommended: ${info.recommended ? '✅' : '❌'}`);
      });
      
    } else {
      console.log('❌ Options endpoint failed:', options.message);
    }

    // Test 2: Test conversion with new models
    console.log('\n🎯 Testing conversion with GPT-4.1-mini...');
    
    const testFigmaData = {
      id: "test-123",
      name: "LongContextTestButton",
      type: "FRAME",
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 50 },
      fills: [{ type: "SOLID", color: { r: 0.2, g: 0.6, b: 1 } }],
      children: [
        {
          id: "test-456", 
          name: "Button Text",
          type: "TEXT",
          characters: "Click Me - Long Context Test",
          style: { fontFamily: "Inter", fontSize: 16, fontWeight: 500 }
        }
      ]
    };

    const convertResponse = await fetch(`${BASE_URL}/api/images/figma-to-code/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        figmaResponse: testFigmaData,
        model: 'gpt-4.1-mini',
        framework: 'vanilla',
        cssFramework: 'vanilla',
        componentName: 'LongContextTestButton'
      })
    });

    const convertResult = await convertResponse.json();
    
    if (convertResult.success) {
      console.log('✅ GPT-4.1-mini conversion successful!');
      console.log(`   Generated ${convertResult.data.files.length} files`);
      console.log(`   Processing time: ${convertResult.processingTime}ms`);
      console.log(`   Model used: ${convertResult.data.model}`);
      console.log(`   Cost: $${convertResult.openaiUsage.cost.toFixed(4)}`);
      
      // Show first file preview
      if (convertResult.data.files.length > 0) {
        const firstFile = convertResult.data.files[0];
        console.log(`\n📄 Generated file preview (${firstFile.filename}):`);
        console.log(firstFile.content.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ GPT-4.1-mini conversion failed:', convertResult.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure server is running: npm run start:dev');
  }
}

// Run tests
testNewModels();
