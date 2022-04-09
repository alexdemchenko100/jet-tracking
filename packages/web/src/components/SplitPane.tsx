import { useCallbackRef } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'

const useDrag = (
  orientation: string,
  containerRef: React.RefObject<HTMLDivElement>,
  leftPaneRef: React.RefObject<HTMLDivElement>,
  enableSplit: boolean,
  initialPaneSize = '1fr',
  handleSize = 10,
  minPaneSize = 400
) => {
  const isHorizontal = orientation === 'horizontal'

  const [paneSize, setPaneSize] = useState<number | null>(null)
  const dragPos = useRef<number | null>(null)
  const containerSize = useRef<number | null>(null)

  const getEventPos = (e: React.MouseEvent) => (isHorizontal ? e.clientX : e.clientY)
  const getRefSize = (ref: React.RefObject<HTMLDivElement>): number => {
    if (ref.current) {
      return isHorizontal ? ref.current.clientWidth : ref.current.clientHeight
    }
    return 0
  }

  const onMouseDown = useCallbackRef((e: React.MouseEvent) => {
    dragPos.current = getEventPos(e)
    containerSize.current = getRefSize(containerRef)
  })

  const onMouseMove = useCallbackRef((e: React.MouseEvent) => {
    if (!dragPos.current) {
      return
    }

    const pos = getEventPos(e)

    const size = paneSize || getRefSize(leftPaneRef)

    if (!containerSize.current) return

    const maxSize = containerSize.current - handleSize - minPaneSize
    console.log('maxWidth', maxSize)
    const newPaneSize = Math.min(maxSize, Math.max(minPaneSize, size + pos - dragPos.current))

    dragPos.current = pos

    setPaneSize(newPaneSize)
  })

  const onMouseUp = () => {
    dragPos.current = null
  }

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove as any)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove as any)
      document.removeEventListener('mouseup', onMouseUp)
    }
  })

  // const [gridProp, setGridProp] = useState(0);
  // useEffect(() => {
  const showInitialSize = paneSize === null

  const paneGridSize = showInitialSize
    ? initialPaneSize
    : `${((paneSize || 1) / getRefSize(containerRef)) * 100}%`

  let gridTemplateProp = `${paneGridSize} ${handleSize}px 1fr`

  const gridProp = isHorizontal
    ? {
        gridTemplateColumns: enableSplit ? gridTemplateProp : '1fr',
      }
    : { gridTemplateRows: enableSplit ? gridTemplateProp : '1fr' }

  // setGridProp(gridProp);
  // }, [paneSize, initialPaneSize, handleSize, isHorizontal]);

  return { isHorizontal, onMouseDown, ...gridProp }
}

interface SplitPaneProps {
  orientation: 'horizontal' | 'vertical'
  children: React.ReactNode[]
}

const SplitPane = ({ orientation, children, ...props }: SplitPaneProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftPaneRef = useRef<HTMLDivElement>(null)

  let pane1 = children ? children[0] : null
  let handle = children && children?.length === 3 ? children[1] : null
  let pane2 = handle ? children[2] : children[1]

  const { isHorizontal, onMouseDown, gridTemplateColumns, gridTemplateRows } = useDrag(
    orientation,
    containerRef,
    leftPaneRef,
    Boolean(pane2)
  )

  const containerStyle = {
    // height: '100%',
    // overflow: 'hidden',
    display: 'grid',
  }

  const pane1Style = {
    // backgroundColor: 'yellow',
    // height: '100%',
    overflow: 'auto',
  }

  const handleStyle: any = {
    // backgroundColor: '#eee',
    // cursor: isHorizontal ? 'col-resize' : 'row-resize',
    // userSelect: 'none',
  }

  const pane2Style = {
    // backgroundColor: 'lime',
    overflow: 'auto',
  }

  // TODO: find handle component by using the type of the children
  // console.log("handle.type is DragHandle", handle?.type === DragHandle);

  return (
    <div
      ref={containerRef}
      {...props}
      style={{ ...containerStyle, gridTemplateColumns, gridTemplateRows }}
    >
      <div ref={leftPaneRef} style={pane1Style}>
        {pane1}
      </div>
      {pane2 && (
        <>
          <div
            className={isHorizontal ? 'gutter gutter-horizontal' : 'gutter gutter-vertical'}
            style={handleStyle}
            onMouseDown={onMouseDown}
          >
            {handle}
          </div>
          <div style={pane2Style}>{pane2}</div>
        </>
      )}
    </div>
  )
}

interface DragHandleProps {
  children: React.ReactNode[]
}

export const DragHandle = ({ children, ...props }: DragHandleProps) => {
  return (
    <div style={{ width: '100%', height: '100%' }} {...props}>
      {children}
    </div>
  )
}

export default SplitPane
