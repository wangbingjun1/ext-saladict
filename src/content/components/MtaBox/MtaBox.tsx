import React, { FC, useRef, useState, useEffect } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import AutosizeTextarea from 'react-textarea-autosize'
import { useObservableState } from 'observable-hooks'
import { switchMap, mapTo, startWith } from 'rxjs/operators'
import { timer, Observable } from 'rxjs'

export interface MtaBoxProps {
  expand: boolean
  maxHeight: number
  text: string
  searchText: (text: string) => any
  onInput: (text: string) => void
  /** Expand or Shrink */
  onDrawerToggle: () => void
  onHeightChanged: (height: number) => void
}

/**
 * Multiline Textarea Drawer. With animation on Expanding and Shrinking.
 */
export const MtaBox: FC<MtaBoxProps> = props => {
  const isTypedRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [height, setHeight] = useState(0)

  const [isTyping, onKeyDown] = useObservableState(transformTyping, false)

  useEffect(() => {
    if (props.expand && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [props.expand])

  useEffect(() => {
    // could be from clipboard with delay
    if (!isTypedRef.current && props.expand && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [props.text])

  useEffect(() => {
    props.onHeightChanged((props.expand ? height : 0) + 12)
  }, [height, props.expand])

  return (
    <div>
      <div
        className={`mtaBox-TextArea-Wrap${isTyping ? ' isTyping' : ''}`}
        style={{
          height: props.expand ? height : 0,
          maxHeight: props.maxHeight
        }}
      >
        <CSSTransition
          in={props.expand}
          timeout={400}
          classNames="mtaBox-TextArea-Wrap"
          appear
          mountOnEnter
          unmountOnExit
        >
          {() => (
            <AutosizeTextarea
              autoFocus
              inputRef={textareaRef}
              className="mtaBox-TextArea"
              style={{ maxHeight: props.maxHeight }}
              value={props.text}
              onChange={e => {
                isTypedRef.current = true
                props.onInput(e.currentTarget.value)
              }}
              onKeyDown={onKeyDown}
              onKeyUp={e => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  props.searchText(props.text)
                }
              }}
              minRows={2}
              onHeightChange={height => setHeight(height)}
            />
          )}
        </CSSTransition>
      </div>
      <button className="mtaBox-DrawerBtn" onClick={props.onDrawerToggle}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 59.414 59.414"
          className={`mtaBox-DrawerBtn_Arrow${props.expand ? ' isExpand' : ''}`}
        >
          <path d="M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56" />
        </svg>
      </button>
    </div>
  )
}

export default MtaBox

function transformTyping(event$: Observable<React.KeyboardEvent>) {
  return event$.pipe(
    switchMap(event => {
      event.stopPropagation()
      return timer(1000).pipe(
        mapTo(false),
        startWith(true)
      )
    })
  )
}
