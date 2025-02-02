import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 10 }, // Aumenta para 10 usuários em 10 segundos
    { duration: '30s', target: 50 }, // Mantém 50 usuários por 30 segundos
    { duration: '10s', target: 0 },  // Diminui para 0 usuários em 10 segundos
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% das requisições devem ser menores que 500ms
    'http_req_failed': ['rate<0.01'],   // Taxa de falhas menor que 1%
  },
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export default function () {
  // Requisição GET para obter um post
  let resGet = http.get(`${BASE_URL}/posts/1`);
  check(resGet, {
    'GET /posts/1 responde 200': (r) => r.status === 200,
    'Tempo de resposta GET < 300ms': (r) => r.timings.duration < 300,
  });

  // Corpo da requisição para o POST
  const payload = JSON.stringify({
    title: 'foo',
    body: 'bar',
    userId: 1,
  });

  const headers = { 'Content-Type': 'application/json' };

  // Requisição POST para criar um novo post
  let resPost = http.post(`${BASE_URL}/posts`, payload, { headers });
  check(resPost, {
    'POST /posts retorna 201': (r) => r.status === 201,
    'Resposta contém ID': (r) => r.json('id') !== undefined,
  });

  // Espera de 1 a 3 segundos antes da próxima iteração
  sleep(Math.random() * 2 + 1);
}
