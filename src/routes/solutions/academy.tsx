import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/solutions/academy')({
  component: () => <Outlet />,
})
