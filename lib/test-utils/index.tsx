import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'

function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return <Theme accentColor="tomato">{children}</Theme>
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
