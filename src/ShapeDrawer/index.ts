import Konva from 'konva'

import { Board } from '../Board'
import { Events } from '../Events'
import { Shape } from '../Shape'

import { IShape, IDrawableShape, DrawType, Point } from '../types'

/**
 * This is an abstract class that Shapes have to extend that to insert or
 * draw their own
 *
 * @example
 * ```ts
 * editor.board.shapes.circle.insert({
 *  x: 100,
 *  y: 100,
 *  radius: 10,
 *  fill: 'red'
 * })
 * ```
 *
 * @example
 * ```ts
 * editor.board.shapes.circle.draw()
 * ```
 *
 * @example
 * ```
 * editor.board.shapes.circle.stopDrawing()
 * ```
 */
export abstract class ShapeDrawer implements IShape, IDrawableShape {
  /**
   * Reperesents the configuration of the shape that is drawing that
   */
  public config: Partial<Konva.ShapeConfig>

  /**
   * Reperesents the start point of the drawing shape
   */
  public startPoint: Point

  /**
   * Reperesents the [[Board]]
   */
  protected readonly board: Board

  /**
   * Reperesents the [[Events]]
   */
  private readonly events: Events

  /***
   * Reperesents [[DrawType | Draw Types]]
   */
  private drawType: DrawType

  /**
   * Reperesents the shape that is drew
   */
  public abstract shape: Konva.Shape | null

  /**
   * Creates a Shape Drawer instance to build and draw different shapes
   *
   * @param board The [[Board]]
   * @param events The [[Events]]
   * @param drawType The type of [[DrawType | Drawing]]
   */
  constructor(board: Board, events: Events, drawType: DrawType) {
    this.board = board
    this.events = events
    this.drawType = drawType

    this.onStartDrawing = this.onStartDrawing.bind(this)
    this.onFinishDrawing = this.onFinishDrawing.bind(this)
    this.onDrawing = this.onDrawing.bind(this)

    this.onKeyDown = this.onKeyDown.bind(this)
  }

  /**
   * Checks wheather the current shape is drawing or not
   */
  public isDrawing() {
    return this.board.activeDrawing === this.drawType
  }

  /**
   * Creates a new shape and insert that into the [[Board]]
   *
   * @param config The [[Shape]] configuration
   * @returns The created [[Shape]]
   *
   * @override
   */
  public insert(config: Konva.ShapeConfig): Shape {
    this.stopDrawing()

    return this.createShape(config)
  }

  /**
   * Enables the drawing mode
   *
   * @param config The initial [[Shape]] config
   *
   * @override
   */
  public draw(config: Partial<Konva.LineConfig | Konva.ArrowConfig> = {}) {
    this.config = config

    // stop previous drawing if exists
    this.stopDrawing()

    this.board.setActiveDrawing(this.drawType)

    this.board.stage.on('mousedown touchstart', this.onStartDrawing)
    this.board.stage.on('mousemove touchmove', this.onDrawing)
    this.board.stage.on('mouseup touchend', this.onFinishDrawing)

    window.addEventListener('mouseup', this.onFinishDrawing)
    window.addEventListener('touchend', this.onFinishDrawing)
    window.addEventListener('keydown', this.onKeyDown)
  }

  /**
   * Stops drawing mode
   */
  public stopDrawing() {
    this.shape = null

    this.board.setActiveDrawing(null)
    this.board.stage.container().style.cursor = 'inherit'

    this.board.stage.off('mousedown touchstart', this.onStartDrawing)
    this.board.stage.off('mousemove touchmove', this.onDrawing)
    this.board.stage.off('mouseup touchend', this.onFinishDrawing)

    window.removeEventListener('mouseup', this.onFinishDrawing)
    window.removeEventListener('touchend', this.onFinishDrawing)
    window.removeEventListener('keydown', this.onKeyDown)
  }

  /**
   * Returns current position of the shape
   *
   * @returns the current position of the shape as a [[Point]]
   */
  public getShapePosition() {
    return {
      x: this.shape!.x(),
      y: this.shape!.y()
    }
  }

  /**
   * Triggers when drawing mode is active and a click, touch or mouse
   * down event receiving on the board. then it starting to create the
   * initial shape for drawing that
   */
  protected onStartDrawing() {
    if (!this.isDrawing()) {
      return
    }

    const { x, y } = this.board.stage.getPointerPosition()!
    this.startPoint = { x, y }
  }

  /**
   * Continues drawing the shape based on the mouse move points
   */
  protected onDrawing(e: Konva.KonvaEventObject<MouseEvent>) {
    if (this.isDrawing()) {
      this.board.stage.container().style.cursor = 'crosshair'
    }
  }

  /**
   * Triggers on mouse up and finalizes the drawing
   */
  protected onFinishDrawing() {
    this.shape = null
    this.board.stage.container().style.cursor = 'inherit'
  }

  /**
   * The keyboard shortcuts for the drawing actions
   */
  private onKeyDown(
    e: Event & {
      key: string
    }
  ) {
    switch (e.key) {
      case 'Escape':
        this.stopDrawing()
        break
    }
  }

  /**
   * Creates a shape to insert into board or start drawing that
   *
   * @param config The [[Shape]] config
   *
   * @virtual
   */
  protected abstract createShape(config: Partial<Konva.ShapeConfig>): Shape
}
