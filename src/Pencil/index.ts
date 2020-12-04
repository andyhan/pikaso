import Konva from 'konva'

import { Board } from '../Board'
import { Events } from '../Events'
import { ShapeDrawer } from '../ShapeDrawer'

import { DrawType } from '../types'

export class Pencil extends ShapeDrawer {
  /**
   * Demonstrates the point (line) shape that is being created
   */
  public shape: Konva.Line

  /**
   * Creates a new free drawing component
   *
   * @param board The [[Board]]
   * @param events The [[Events]]
   */
  constructor(board: Board, events: Events) {
    super(board, events, DrawType.Pencil)
  }

  /**
   * @inheritdoc
   * @override
   */
  public draw(config: Partial<Konva.LineConfig> = {}) {
    super.draw(config)
  }

  /**
   * @inheritdoc
   * @override
   */
  protected createShape(config: Konva.LineConfig) {
    this.shape = new Konva.Line(config)

    return this.board.addShape(this.shape)
  }

  /**
   * Starts free drawing
   */
  protected onStartDrawing() {
    super.onStartDrawing()

    this.createShape({
      globalCompositeOperation: 'source-over',
      points: [this.startPoint.x, this.startPoint.y],
      ...this.config
    })
  }

  /**
   * Continues free drawing by concating the points together
   */
  protected onDrawing(e: Konva.KonvaEventObject<MouseEvent>) {
    super.onDrawing(e)

    if (!this.shape) {
      return
    }

    const point = this.board.stage.getPointerPosition()!
    this.shape.points(this.shape.points().concat([point.x, point.y]))

    this.board.draw()
  }
}
