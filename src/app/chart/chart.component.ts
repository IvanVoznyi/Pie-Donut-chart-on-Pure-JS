import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-chart",
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input()
  width = 100;
  @Input()
  height = this.width / 2;
  @Input()
  innerRadius = 0;

  items: Array<{
    value: string;
    color: string;
  }> = [];

  constructor() {}

  radian(angle: number) {
    return (angle * Math.PI) / 180;
  }

  arcRadius(centerX: number, centerY: number, radius: number, angle: number) {
    return {
      x: centerX + radius * Math.sin(this.radian(angle)),
      y: centerY - radius * Math.cos(this.radian(angle)),
    };
  }

  calcDiameterPie(
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    radius: number
  ) {
    const { x: x1, y: y1 } = this.arcRadius(
      centerX,
      centerY,
      radius,
      startAngle
    );
    const { x: x2, y: y2 } = this.arcRadius(centerX, centerY, radius, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return {
      begin: {
        x: x1,
        y: y1,
      },
      end: {
        x: x2,
        y: y2,
      },
      largeArcFlag,
    };
  }

  calcDiameterDonut(
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ) {
    const { x: beginInnerRadiusX, y: beginInnerRadiusY } = this.arcRadius(
      centerX,
      centerY,
      innerRadius,
      startAngle
    );
    const { x: beginOuterRadiusX, y: beginOuterRadiusY } = this.arcRadius(
      centerX,
      centerY,
      outerRadius,
      startAngle
    );
    const { x: endOuterRadiusX, y: endOuterRadiusY } = this.arcRadius(
      centerX,
      centerY,
      outerRadius,
      endAngle
    );
    const { x: endInnerRadiusX, y: endInnerRadiusY } = this.arcRadius(
      centerX,
      centerY,
      innerRadius,
      endAngle
    );

    let largeArcFlag = endAngle - startAngle < 180 ? 0 : 1;

    return {
      beginInnerRadius: {
        x: beginInnerRadiusX,
        y: beginInnerRadiusY,
      },
      beginOuterRadius: {
        x: beginOuterRadiusX,
        y: beginOuterRadiusY,
      },
      endInnerRadius: {
        x: endInnerRadiusX,
        y: endInnerRadiusY,
      },
      endOuterRadius: {
        x: endOuterRadiusX,
        y: endOuterRadiusY,
      },
      largeArcFlag,
    };
  }

  pie(
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    radius: number
  ) {
    const { begin, end, largeArcFlag } = this.calcDiameterPie(
      centerX,
      centerY,
      startAngle,
      endAngle,
      radius
    );
    return `M ${centerX} ${centerY} L ${begin.x} ${begin.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  }

  donut(
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ) {
    const {
      beginInnerRadius,
      beginOuterRadius,
      endInnerRadius,
      endOuterRadius,
      largeArcFlag,
    } = this.calcDiameterDonut(
      centerX,
      centerY,
      startAngle,
      endAngle,
      outerRadius,
      innerRadius
    );
    return `
            M ${beginInnerRadius.x} ${beginInnerRadius.y}
            L ${beginOuterRadius.x} ${beginOuterRadius.y}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterRadius.x} ${endOuterRadius.y}
            L ${endInnerRadius.x} ${endInnerRadius.y}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${beginInnerRadius.x} ${beginInnerRadius.y}
            z
          `;
  }

  ngOnInit(): void {
    let centerX = this.width / 2;
    let centerY = this.height;
    let radius = this.height;
    let data = [140, 100, 110, 90, 170, 125];
    let color = [
      "#FF6633",
      "#FFB399",
      "#FF33FF",
      "#FFFF99",
      "#00B3E6",
      "#E6B333",
    ];

    const sum = data.reduce((prev, curr) => (prev += curr), 0);
    const offset = 0;

    let percentOf360Degree = 0;

    data.forEach((item, index) => {
      let angle = 360 * (item / sum);

      const startAngle = percentOf360Degree;

      const endAngle = percentOf360Degree + angle;

      let pathData = this.donut(
        centerX,
        centerY,
        startAngle,
        endAngle - offset,
        radius - offset,
        this.innerRadius >= this.width / 2
          ? this.width / 2 - 1
          : this.innerRadius
      );

      percentOf360Degree += angle;

      this.items.push({
        value: pathData,
        color: color[index],
      });
    });
  }
}
