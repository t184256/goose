import { Check, Copy } from 'lucide-react'

import { Highlight } from 'prism-react-renderer'
import React, { useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '../../../lib/utils'
import { Button } from './button'

const markdownComponents: Components = {
  // Emphasis (italics)
  em: ({ children }) => <em className='italic font-medium'>{children}</em>,

  // Code block outer shell (pre + code)
  pre: ({ children }: React.ComponentProps<'pre'>) => {
    // react-markdown doesn't give us a parent-level flag for code blocks,
    // so we inspect children to see if any have a language- class.
    const hasCodeBlockChild = React.Children.toArray(children).some((child) => {
      if (!React.isValidElement<{ className?: string }>(child)) return false
      const className = child.props.className
      return typeof className === 'string' && className.includes('language-')
    })

    // Only add padding if we don't have a code block
    const textClassName = !hasCodeBlockChild ? 'px-2 py-2 font-normal' : ''

    // This is preformatted text
    return (
      <div className='my-4'>
        <pre className={cn('rounded-xl font-mono text-sm leading-relaxed overflow-x-auto border', textClassName)}>{children}</pre>
      </div>
    )
  },

  // Code content with syntax highlighting
  code: ({ inline, className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : 'text'

    if (!inline && match) {
      // This is a code block
      const code = String(children).replace(/\n$/, '')

      // Copy button component with state
      const CopyButton = () => {
        const [copied, setCopied] = useState(false)

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => {
              setCopied(false)
            }, 2000)
          } catch (err) {
            console.error('Failed to copy code:', err)
          }
        }

        return (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCopy}
            className={cn(
              'h-6 p-1 flex items-center justify-center transition-[width] duration-300 ease-in-out',
              copied ? 'w-16 hover:bg-transparent hover:opacity-100' : 'w-8 hover:bg-black/10 dark:hover:bg-white/10',
            )}
            aria-label='Copy code to clipboard'
          >
            {copied ? (
              <div className='flex items-center gap-1'>
                <Check className='h-3 w-3 text-green-400' />
                <span className='text-xs text-green-400'>Copied</span>
              </div>
            ) : (
              <Copy className='h-3 w-3' />
            )}
          </Button>
        )
      }

      return (
        <>
          {/* Header */}
          <div className='px-4 py-2 flex items-center justify-between'>
            {/* Show terminal header if we dont know the language */}
            <span>{language === 'text' ? 'Terminal' : language}</span>
            <CopyButton />
          </div>

          {/* Code content */}
          <div className='bg-neutral-900 dark:bg-neutral-800 p-4 overflow-x-auto rounded-lg'>
            <Highlight code={code} language={language}>
              {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre className='font-mono text-sm leading-relaxed m-0' style={{ ...style, background: 'transparent' }}>
                  {tokens.map((line, i: number) => {
                    const lineProps = getLineProps({ line, key: i })
                    return (
                      <div key={i} {...lineProps}>
                        {line.map((token, key: number) => {
                          const tokenProps = getTokenProps({ token, key })
                          return <span key={key} {...tokenProps} style={tokenProps.style} />
                        })}
                      </div>
                    )
                  })}
                </pre>
              )}
            </Highlight>
          </div>
        </>
      )
    }

    // Inline code
    return (
      <code className='rounded font-mono bg-neutral-700 dark:bg-neutral-800 text-neutral-100 px-1 py-0.5' {...props}>
        {children}
      </code>
    )
  },

  // Block quotes
  blockquote: ({ children }) => (
    <blockquote className='border-l-4 border-border pl-4 py-3 my-4'>
      <div className='flex-1'>{children}</div>
    </blockquote>
  ),

  // Images
  // TODO: GOOS-375: Add support for image viewing
  img: ({ src, alt }) => (
    <div className='my-6 text-center'>
      <img src={src} alt={alt} className='rounded-3xl' />
      {alt && <p className='text-sm text-muted-foreground mt-2 italic'>{alt}</p>}
    </div>
  ),

  // Line breaks
  br: () => <br className='my-2' />,

  // Horizontal rules
  hr: ({ ...props }) => <hr className='border-border-default' {...props} />,

  // Superscript
  // TODO: GOOS-375: Add support for superscript
  // sup: ({ children }) => <sup">{children}</sup>,

  // Subscript
  // TODO: GOOS-375: Add support for subscript
  // sub: ({ children }) => <sub>{children}</sub>,

  // Headings
  h1: ({ children }) => <h1 className='text-2xl font-bold '>{children}</h1>,
  h2: ({ children }) => <h2 className='text-xl font-medium '>{children}</h2>,
  h3: ({ children }) => <h3 className='text-lg font-medium '>{children}</h3>,
  p: ({ children }) => <p className='first:mt-0 last:mb-0'>{children}</p>,

  // Lists
  ul: ({ children }) => <ul className='list-disc list-inside ps-2'>{children}</ul>,
  li: (props: React.ComponentProps<'li'>) => {
    const { children, ...rest } = props
    return (
      <li className='mb-1 [&_p]:inline-block' {...rest}>
        {children}
      </li>
    )
  },
  ol: ({ children }) => <ol className='list-decimal list-inside ps-2'>{children}</ol>,

  // Tables
  table: ({ children, ...props }) => (
    <div className='overflow-x-auto rounded-lg border border-border'>
      <table className='border-collapse w-full overflow-hidden' {...props}>
        {children}
      </table>
    </div>
  ),
  th: (props: React.ComponentProps<'th'>) => {
    const { children, ...rest } = props
    return (
      <th className='px-2 py-3 text-left bg-surface-surface-10 font-medium' {...rest}>
        {children}
      </th>
    )
  },
  tr: (props: React.ComponentProps<'tr'>) => {
    const { children, ...rest } = props
    return (
      <tr className='border-b border-border last:border-b-0' {...rest}>
        {children}
      </tr>
    )
  },
  td: (props: React.ComponentProps<'td'>) => {
    const { children, ...rest } = props
    return (
      <td className='px-2 py-3 text-left' {...rest}>
        {children}
      </td>
    )
  },

  // Links
  a: ({ href, children, ...props }) => (
    <a href={href} target='_blank' rel='noopener noreferrer' className='underline text-primary hover:text-primary/80' {...props}>
      {children}
    </a>
  ),

  // Typography
  strong: ({ children, ...props }) => (
    <strong className='font-semibold' {...props}>
      {children}
    </strong>
  ),
}

export const Markdown = ({ content }: { content: string }) => {
  return (
    <div className='prose prose-sm dark:prose-invert max-w-none break-words'>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
