document.addEventListener('DOMContentLoaded', () => {
  const factorBtn = document.getElementById('factorBtn');
  const stepsDiv = document.getElementById('steps');
  
  factorBtn.addEventListener('click', () => {
    const userPolynomial = document.getElementById('userPolynomial').value;
    const resultHTML = factorDifferenceOfSquares(userPolynomial);
    stepsDiv.innerHTML = resultHTML;
    
    // Recargamos MathJax para renderizar las fórmulas en LaTeX
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  });
});

/**
 * Factoriza una diferencia de cuadrados, soportando coeficientes fraccionarios.
 * Se asume que la expresión tiene la forma:
 * a - b, donde a y b son cuadrados perfectos.
 *
 * Ejemplo: "9/4x^2 - 16/9y^2" se factoriza como:
 * \[
 * \left(\frac{3}{2}x - \frac{4}{3}y\right)\left(\frac{3}{2}x + \frac{4}{3}y\right)
 * \]
 *
 * @param {string} polyStr - La expresión algebraica.
 * @return {string} HTML con el paso a paso.
 */
function factorDifferenceOfSquares(polyStr) {
  // Eliminar espacios
  let poly = polyStr.replace(/\s+/g, '');
  
  // Verificar que la expresión contenga el signo '-' (diferencia)
  let indexMinus = poly.indexOf('-');
  if (indexMinus === -1) {
    return `<p>La expresión debe contener el signo '-' para representar una diferencia de cuadrados.</p>`;
  }
  
  // Dividir la expresión en dos partes (a y b)
  let leftPart = poly.substring(0, indexMinus);
  let rightPart = poly.substring(indexMinus + 1);
  
  // Parsear cada término
  let termA = parseTerm(leftPart);
  let termB = parseTerm(rightPart);
  
  // Verificar que ambos términos sean cuadrados perfectos
  let sqrtA = sqrtTerm(termA);
  let sqrtB = sqrtTerm(termB);
  
  if (!sqrtA || !sqrtB) {
    return `<p>Alguno de los términos no es un cuadrado perfecto.</p>`;
  }
  
  // Construir el paso a paso en formato LaTeX
  let stepHTML = `
    <p><strong>Paso 1: Identificar la diferencia de cuadrados</strong><br>
      La expresión ingresada es: \\( ${formatTerm(termA, false)} - ${formatTerm(termB, false)} \\)
    </p>
    <p><strong>Paso 2: Calcular las raíces cuadradas</strong><br>
      Para el primer término:  
      \\( ${formatTerm(termA, false)} = \\Bigl(${formatTerm(sqrtA, false)}\\Bigr)^2 \\)<br>
      Para el segundo término:  
      \\( ${formatTerm(termB, false)} = \\Bigl(${formatTerm(sqrtB, false)}\\Bigr)^2 \\)
    </p>
    <p><strong>Paso 3: Aplicar la fórmula de diferencia de cuadrados</strong><br>
      Recordamos que: \\( a^2 - b^2 = (a - b)(a + b) \\).<br>
      Por lo tanto:<br>
      \\[
        ${formatTerm(termA, false)} - ${formatTerm(termB, false)} 
        = \\Bigl(${formatTerm(sqrtA, false)} - ${formatTerm(sqrtB, false)}\\Bigr)
        \\Bigl(${formatTerm(sqrtA, false)} + ${formatTerm(sqrtB, false)}\\Bigr)
      \\]
    </p>
  `;
  return stepHTML;
}

/**
 * Parsea un término de la forma "9/4x^2" o "16/9y^2" y retorna un objeto:
 * { coef, coefStr, variable, exp }.
 */
function parseTerm(termStr) {
  // Regex para coeficiente: admite dígitos, opcionalmente fracción (p.ej. 9/4)
  const regexCoef = /^([+-]?\d+(?:\/\d+)?)/;
  const matchCoef = termStr.match(regexCoef);
  let coefStr = matchCoef && matchCoef[0] ? matchCoef[0] : '';
  let coef;
  if (coefStr.includes('/')) {
    let parts = coefStr.split('/');
    coef = parseFloat(parts[0]) / parseFloat(parts[1]);
  } else {
    if (coefStr === '' || coefStr === '+') {
      coef = 1;
      coefStr = '1';
    } else if (coefStr === '-') {
      coef = -1;
      coefStr = '-1';
    } else {
      coef = parseFloat(coefStr);
    }
  }
  // Eliminar el coeficiente para procesar la variable
  let remainder = termStr.replace(regexCoef, '');
  
  // Extraer la variable y su exponente
  let varMatch = remainder.match(/([a-zA-Z])(\^(\d+))?/);
  let variable = '';
  let exp = 0;
  if (varMatch) {
    variable = varMatch[1];
    exp = varMatch[3] ? parseInt(varMatch[3], 10) : 1;
  }
  return { coef, coefStr, variable, exp };
}

/**
 * Calcula la raíz cuadrada del término (si es cuadrado perfecto).
 * Para coeficientes fraccionarios se verifica que tanto el numerador
 * como el denominador sean cuadrados perfectos.
 *
 * Retorna un objeto { coef, coefStr, variable, exp } o null en caso contrario.
 */
function sqrtTerm(term) {
  let sqrtCoef;
  let newCoefStr;
  if (term.coefStr.includes('/')) {
    // Caso fraccional
    let parts = term.coefStr.split('/');
    let num = parseFloat(parts[0]);
    let den = parseFloat(parts[1]);
    let sqrtNum = Math.sqrt(num);
    let sqrtDen = Math.sqrt(den);
    if (!Number.isInteger(sqrtNum) || !Number.isInteger(sqrtDen)) return null;
    sqrtCoef = sqrtNum / sqrtDen;
    newCoefStr = `\\frac{${sqrtNum}}{${sqrtDen}}`;
  } else {
    sqrtCoef = Math.sqrt(Math.abs(term.coef));
    if (!Number.isInteger(sqrtCoef)) return null;
    newCoefStr = `${sqrtCoef}`;
  }
  
  // El exponente debe ser par para extraer la raíz
  if (term.exp % 2 !== 0) return null;
  
  return { coef: sqrtCoef, coefStr: newCoefStr, variable: term.variable, exp: term.exp / 2 };
}

/**
 * Convierte un término a una cadena en formato LaTeX.
 * Si showSign es false, no se muestra el signo '+' inicial.
 */
function formatTerm(term, showSign = true) {
  let coefStr = term.coefStr;
  let numericValue = term.coef;
  let signStr = '';
  if (showSign) {
    if (numericValue >= 0) signStr = '+';
    else signStr = '-';
  } else {
    if (numericValue < 0) signStr = '-';
  }
  
  let showCoef = true;
  if (term.variable && Math.abs(numericValue) === 1) {
    showCoef = false;
  }
  
  let coefDisplay = '';
  if (showCoef) {
    if (coefStr.includes('/')) {
      // Formatear fracción en LaTeX
      let parts = coefStr.split('/');
      coefDisplay = `\\frac{${parts[0]}}{${parts[1]}}`;
    } else {
      coefDisplay = coefStr;
    }
  }
  
  let varPart = '';
  if (term.variable) {
    varPart = term.variable;
    if (term.exp !== 1) varPart += `^{${term.exp}}`;
  }
  return `${signStr}${coefDisplay}${varPart}`;
}
