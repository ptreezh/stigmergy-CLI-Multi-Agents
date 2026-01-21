// 计算斐波那契数列的前n项
function fibonacci(n) {
  const result = [];
  
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      result.push(0);
    } else if (i === 1) {
      result.push(1);
    } else {
      result.push(result[i - 1] + result[i - 2]);
    }
  }
  
  return result;
}

// 计算并输出斐波那契数列的前5项
const fib5 = fibonacci(5);
console.log('斐波那契数列的前5项是：', fib5);

// 输出详细信息
fib5.forEach((num, index) => {
  console.log(`第${index + 1}项: ${num}`);
});