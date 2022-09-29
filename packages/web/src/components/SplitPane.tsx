import { useCallbackRef } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'

const useDrag = (
  orientation: string,
  containerRef: React.RefObject<HTMLDivElement>,
  paneOneRef: React.RefObject<HTMLDivElement>,
  enableSplit: boolean,
  handleSize = 10,
  minPaneSize = 300
) => {
  const isHorizontal = orientation === 'horizontal'

  const [paneOneWidth, setPaneOneWidth] = useState<number | null>(null)
  const dragPosHorizontal = useRef<number | null>(null)
  const containerWidth = useRef<number | null>(null)

  const [paneOneHeight, setPaneOneHeight] = useState<number | null>(null)
  const dragPosVertical = useRef<number | null>(null)
  const containerHeight = useRef<number | null>(null)

  const getEventPos = (e: React.MouseEvent) => (isHorizontal ? e.clientX : e.clientY)

  const getSplitContainerSize = (ref: React.RefObject<HTMLDivElement>): number => {
    if (ref.current) {
      //console.log('ref w, h', ref.current.clientWidth, ref.current.clientHeight)
      return isHorizontal ? ref.current.clientWidth : ref.current.clientHeight
    }
    return 0
  }

  const onMouseDown = useCallbackRef((e: React.MouseEvent) => {
    if (isHorizontal) {
      dragPosHorizontal.current = getEventPos(e)
      containerWidth.current = getSplitContainerSize(containerRef)
    } else {
      dragPosVertical.current = getEventPos(e)
      containerHeight.current = getSplitContainerSize(containerRef)
    }
  })

  const onMouseMove = useCallbackRef((e: React.MouseEvent) => {
    if (isHorizontal && dragPosHorizontal.current) {
      const pos = getEventPos(e)
      const size = paneOneWidth || getSplitContainerSize(paneOneRef)

      if (!containerWidth.current) return

      const maxSize = containerWidth.current - handleSize - minPaneSize
      //console.log('maxWidth', maxSize)
      const newPaneOneSize = Math.min(
        maxSize,
        Math.max(minPaneSize, size + pos - dragPosHorizontal.current)
      )

      dragPosHorizontal.current = pos
      setPaneOneWidth(newPaneOneSize)
    } else if (!isHorizontal && dragPosVertical.current) {
      const pos = getEventPos(e)
      const size = paneOneHeight || getSplitContainerSize(paneOneRef)

      if (!containerHeight.current) return

      const maxSize = containerHeight.current - handleSize - minPaneSize
      //console.log('maxHeight', maxSize)
      const newPaneOneSize = Math.min(
        maxSize,
        Math.max(minPaneSize, size + pos - dragPosVertical.current)
      )

      dragPosVertical.current = pos

      setPaneOneHeight(newPaneOneSize)
    }
  })

  const onMouseUp = () => {
    if (isHorizontal) {
      dragPosHorizontal.current = null
    } else {
      dragPosVertical.current = null
    }
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

  const showInitialSize = isHorizontal ? paneOneWidth === null : paneOneHeight === null

  let gridProp = { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }
  if (isHorizontal) {
    const newPaneOneSizeInGridUnits = showInitialSize
      ? '1fr'
      : `${((paneOneWidth || 1) / getSplitContainerSize(containerRef)) * 100}%`

    gridProp.gridTemplateColumns = enableSplit
      ? `${newPaneOneSizeInGridUnits} ${handleSize}px 1fr`
      : '1fr'
  } else {
    const newPaneOneSizeInGridUnits = showInitialSize
      ? '1fr'
      : `${((paneOneHeight || 1) / getSplitContainerSize(containerRef)) * 100}%`

    gridProp.gridTemplateRows = enableSplit
      ? `${newPaneOneSizeInGridUnits} ${handleSize}px 1fr`
      : '1fr'
  }

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
  const paneOneRef = useRef<HTMLDivElement>(null)

  let pane1 = children ? children[0] : null
  let handle = children && children?.length === 3 ? children[1] : null
  let pane2 = handle ? children[2] : children[1]

  const { isHorizontal, onMouseDown, gridTemplateColumns, gridTemplateRows } = useDrag(
    orientation,
    containerRef,
    paneOneRef,
    Boolean(pane2)
  )

  const containerStyle = {
    width: '100%',
    // height: '100%',
    height: isHorizontal ? 'auto' : 'calc(100vh - 4.5em)',
    // overflow: 'auto',
    display: 'grid',
  }

  const pane1Style = {
    // backgroundColor: 'yellow',
    //height: '100%',
    overflow: !isHorizontal && pane2 ? 'auto' : 'inherit',
  }

  const handleStyle: any = {
    backgroundColor: 'transparent',
    // cursor: isHorizontal ? 'col-resize' : 'row-resize',
    // userSelect: 'none',
  }

  const pane2Style = {
    // backgroundColor: 'lime',
    overflow: isHorizontal ? 'inherit' : 'auto',
  }

  // TODO: find handle component by using the type of the children
  // console.log("handle.type is DragHandle", handle?.type === DragHandle);

  //console.log('--- isHorizontal', isHorizontal)

  return (
    <div
      ref={containerRef}
      {...props}
      style={{ ...containerStyle, gridTemplateColumns, gridTemplateRows }}
    >
      <div ref={paneOneRef} style={pane1Style}>
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
  return <div {...props}>{children}</div>
}

export default SplitPane
