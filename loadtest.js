import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    fixed_requests: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 1000,
      maxDuration: '2m',
    },
  },
  discardResponseBodies: true,
};

export default function () {
  const response = http.get('http://nginx/health');

  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
