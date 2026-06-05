import { Link } from 'react-router-dom';

export function NotFoundRoute() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404 — 页面不存在</h1>
      <p>
        <Link to="/" style={{ textDecoration: 'underline' }}>
          返回主页
        </Link>
      </p>
    </div>
  );
}
