const { processCSV } = require('../../src/utils');

describe('CSV Processing', () => {
  test('should process basic CSV with headers', () => {
    const csvData = `name,age,city
John,25,New York
Jane,30,Boston`;

    const result = processCSV(csvData);
    
    expect(result.rowCount).toBe(2);
    expect(result.columnCount).toBe(3);
    expect(result.headers).toEqual(['name', 'age', 'city']);
    expect(result.columns.name.count).toBe(2);
    expect(result.columns.age.numericStats.average).toBe(27.5);
  });

  test('should process CSV without headers', () => {
    const csvData = `John,25,New York
Jane,30,Boston`;

    const result = processCSV(csvData, { hasHeader: false });
    
    expect(result.rowCount).toBe(2);
    expect(result.columnCount).toBe(3);
    expect(result.headers).toEqual([]);
    expect(result.columns['0'].count).toBe(2);
    expect(result.columns['1'].numericStats.average).toBe(27.5);
  });

  test('should handle empty CSV data', () => {
    const csvData = '';
    
    const result = processCSV(csvData);
    
    expect(result.rowCount).toBe(0);
  });

  test('should calculate numeric statistics correctly', () => {
    const csvData = `value
10
20
30
40
50`;

    const result = processCSV(csvData);
    
    expect(result.columns.value.numericStats.min).toBe(10);
    expect(result.columns.value.numericStats.max).toBe(50);
    expect(result.columns.value.numericStats.sum).toBe(150);
    expect(result.columns.value.numericStats.average).toBe(30);
  });
});