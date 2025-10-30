// script.js - Calculadora simple con validación básica antes de evaluar

const displayEl = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let expression = ''; // cadena mostrada
updateDisplay();

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'clear') {
      clearAll();
    } else if (action === 'back') {
      backspace();
    } else if (action === 'equals') {
      evaluateExpression();
    } else if (val !== undefined) {
      appendValue(val);
    }
  });
});

// Soporte para teclado
window.addEventListener('keydown', (e) => {
  const allowedKeys = '0123456789+-*/().';
  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    evaluateExpression();
    return;
  }
  if (e.key === 'Backspace') {
    e.preventDefault();
    backspace();
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    clearAll();
    return;
  }
  if (allowedKeys.includes(e.key)) {
    e.preventDefault();
    appendValue(e.key);
  }
});

function appendValue(v) {
  // Evitar dobles operadores (por ejemplo "+*" o "--" sin sentido)
  const last = expression.slice(-1);

  // Normalizamos ×/÷ en simbología JS
  if (v === '×') v = '*';
  if (v === '÷') v = '/';
  if (v === '−') v = '-';

  // Si es punto, prevenir múltiples puntos en el mismo número
  if (v === '.') {
    // busca la última secuencia entre operadores
    const parts = expression.split(/[\+\-\*\/\(\)]/);
    const lastNum = parts[parts.length - 1];
    if (lastNum.includes('.')) return;
    if (last === '') {
      // si empieza con punto, permitir "0."
      expression += '0';
    }
    expression += '.';
    updateDisplay();
    return;
  }

  // Si es operador y expression vacío -> no permitir excepto '-'
  if (isOperator(v)) {
    if (expression === '' && v !== '-') return;
    // si el último también es operador, reemplazar (permitir un "-" después de operador para números negativos)
    if (isOperator(last)) {
      // permitir cosas como "5 * -3"
      if (v === '-' && last !== '-') {
        expression += '-';
      } else {
        // reemplazar último operador por el nuevo
        expression = expression.slice(0, -1) + v;
      }
      updateDisplay();
      return;
    }
  }

  expression += v;
  updateDisplay();
}

function isOperator(ch) {
  return ['+', '-', '*', '/'].includes(ch);
}

function clearAll() {
  expression = '';
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function updateDisplay() {
  displayEl.value = expression || '0';
}

// VALIDACIÓN y evaluación segura
function evaluateExpression() {
  if (!expression) return;
  // Validar: solo números, operadores, paréntesis y punto
  // Esto evita inyecciones de código como letras, llamadas a funciones, etc.
  const validPattern = /^[0-9+\-*/().\s]+$/;
  if (!validPattern.test(expression)) {
    showError('Entrada inválida');
    return;
  }

  // Evitar secuencias inválidas como "*/" al inicio, o "()()" sueltas
  try {
    // Evalúa la expresión (ya validada). Usamos Function como alternativa a eval; comportamiento similar.
    const result = Function('"use strict"; return (' + expression + ')')();
    // Comprobar que el resultado es número finito
    if (typeof result === 'number' && isFinite(result)) {
      // Limitar decimales a 10 para evitar notación científica
      const displayResult = Number.isInteger(result) ? result : +result.toFixed(10);
      expression = String(displayResult);
      updateDisplay();
    } else {
      showError('Resultado no válido');
    }
  } catch (err) {
    showError('Error de cálculo');
  }
}

function showError(msg) {
  displayEl.value = msg;
  setTimeout(() => updateDisplay(), 900);
}