import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AreaModel } from '../../../model/AreaModel';

@Component({
  selector: 'app-area-view',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './area-view.component.html',
  styleUrl: './area-view.component.scss'
})
export class AreaViewComponent implements OnInit {
  @Input() area: any;  
  @Input() subtractLevel: number = 0;
  @Input() areaIdMove: number = 0;
  @Input() isSelectArea?: boolean = false;
  @Input() isShowChildren?: boolean = false;
  @Output() doChangeAreaIdMove = new EventEmitter<AreaModel>();
  ngOnInit(): void {
  }

  onOpenChildren(){
    this.isShowChildren = !this.isShowChildren;
  }

  doActiveArea(areaMoveTo: AreaModel): void{
    if(areaMoveTo && areaMoveTo.children.length == 0)
    {
      this.doChangeAreaIdMove.emit(areaMoveTo)
    }
  }
}
