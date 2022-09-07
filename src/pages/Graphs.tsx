import {IonButton, IonLoading} from '@ionic/react';
import './Graphs.css';
import {csv, axisBottom, axisLeft, curveBasis, line, scaleLinear, select} from "d3";
import React from "react";
import * as d3 from "d3";
import {showTabs} from "../App";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Button, ToggleButton, ToggleButtonGroup} from "@mui/material";

let start1 = 0;
let end1 = 0;
let start2 = 0;
let end2 = 0;
let peak1 = 0;
let peak2 = 0;
let maxAmp1 = 0;
let maxAmp2 = 0;

class Graphs extends React.Component <{ popover: boolean; value: string; value2: string; storedFileNames: string[]; },
    {open: boolean,
    graph: string,
    attack1: number,
    attack2: number,
    sustain1: number,
    sustain2: number,
    showLoading: boolean}> {

    constructor(props: any) {
        super(props);
        this.state = {
            open: false,
            graph: "b",
            attack1: 0,
            attack2: 0,
            sustain1: 0,
            sustain2: 0,
            showLoading: false
        };
    };

    componentDidMount() {
        showTabs();
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });

    };

    handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newGraph: string
    ) => {
        this.setState({graph:newGraph});
    };

    render() {

        const width = 360;
        const height = 270;

        const render = (data: any, data2: any ) => {
            const title = 'Amplitude';
            const svg = select('svg.graph');

            const xValue = (d: any) => d.Count;
            const yValue = (d: any) => d.Amplitude;
            let max1 = Number(d3.max(data, function(d) { return xValue(d); }));
            let max2 = Number(d3.max(data2, function(d) { return xValue(d); }));
            let max: number;
            if (max1 > max2) {
                max = max1;
            } else {
                max = max2;
            }

            const seconds = max/48000;
            const margin = { top: 60, right: 20, bottom: 60, left: 45 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const xScale = scaleLinear()
                .domain([0,max])
                .range([0, innerWidth])
                .nice();

            const xTickScale = scaleLinear()
                .domain([0,seconds])
                .range([0, innerWidth])
                .nice();

            const yScale = scaleLinear()
                .domain([-1,1])
                .range([innerHeight, 10])
                .nice();

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const xAxis = axisBottom(xTickScale)
                .tickSize(-innerHeight)
                .tickPadding(10);

            const yAxis = axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickPadding(10);

            const yAxisG = g.append('g').call(yAxis);
            yAxisG.selectAll('.domain').remove();

            yAxisG.append('text')
                .attr('class', 'axis-label')
                .attr('y', -35)
                .attr('x', -innerHeight / 2)
                .attr('fill', 'black')
                .attr('transform', `rotate(-90)`)
                .attr('text-anchor', 'middle')
                .text("Amplitude");

            const xAxisG = g.append('g').call(xAxis)
                .attr('transform', `translate(0,${innerHeight})`);

            xAxisG.select('.domain').remove();

            xAxisG.append('text')
                .attr('class', 'axis-label')
                .attr('y', 35)
                .attr('x', innerWidth / 2)
                .attr('fill', 'black')
                .text("Seconds");

            const lineGenerator = line()
                .x(d => xScale(xValue(d)))
                .y(d => yScale(yValue(d)))
                .curve(curveBasis);

            g.append('path')
                .attr('class', 'line-path')
                .attr('d', lineGenerator(data));

            g.append('path')
                .attr('class', 'line-path2')
                .attr('d', lineGenerator(data2));

            g.append('text')
                .attr('class', 'title')
                .attr('y', -10)
                .text(title);
        }

        return (
            <div className="btn">
                <div>
                    <IonLoading
                        cssClass='my-custom-class'
                        isOpen={this.state.showLoading}
                        message={'Loading...'}
                    />
                    <IonButton size="default" onClick={() => {
                        let user = window.sessionStorage.getItem("username");
                        let file = this.props.value.substring(0,this.props.value.length-4) + ".csv";
                        let file2 = this.props.value2.substring(0,this.props.value2.length-4) + ".csv";
                        console.log(user);
                        console.log(file);
                        console.log(file2);

                        start1 = 0;
                        end1 = 0;
                        start2 = 0;
                        end2 = 0;
                        peak1 = 0;
                        peak2 = 0;
                        maxAmp1 = 0;
                        maxAmp2 = 0;

                        csv(`http://34.125.224.168:8001/null/${file}`)
                            .then((data1: any)  => {
                                this.setState({showLoading:true});
                                data1.forEach((d: { Count: number; Amplitude: number; }) => {
                                    d.Count = +d.Count;
                                    d.Amplitude = +d.Amplitude;
                                    if (start1 === 0 && +d.Amplitude > 0.03) {
                                        start1 = +d.Count;
                                    }
                                    if (start1 > 0 && +d.Amplitude < 0.03) {
                                        end1 = +d.Count;
                                    }
                                    if (+d.Amplitude > maxAmp1) {
                                        maxAmp1 = +d.Amplitude;
                                        peak1 = +d.Count;
                                    }
                                });
                                csv(`http://34.125.224.168:8001/null/${file2}`)
                                    .then((data2: any) => {
                                        data2.forEach((d: { Count: number; Amplitude: number; }) => {
                                            d.Count = +d.Count;
                                            d.Amplitude = +d.Amplitude;
                                            if (start2 === 0 && +d.Amplitude > 0.025) {
                                                start2 = +d.Count;
                                            }
                                            if (start2 > 0 && +d.Amplitude < 0.025) {
                                                end2 = +d.Count;
                                            }
                                            if (+d.Amplitude > maxAmp2) {
                                                maxAmp2 = +d.Amplitude;
                                                peak2 = +d.Count;
                                            }
                                        });
                                        this.setState({showLoading:false});
                                        this.handleOpen();
                                        this.setState({attack1:+((peak1-start1)/48).toFixed(2)})
                                        this.setState({attack2:+((peak2-start2)/48).toFixed(2)})
                                        this.setState({sustain1:+((end1-peak1)/48).toFixed(2)})
                                        this.setState({sustain2:+((end2-peak2)/48).toFixed(2)})
                                        render(data1, data2);
                                    });
                            });
                    }}>
                        Analyze
                    </IonButton>
                </div>
                <Dialog open={this.state.open} onClose={this.handleClose} PaperProps={{ sx: { width: "90%", height: "70%" } }}>
                    <DialogContent style={{ paddingTop: 20 }}>
                        <svg className="graph" width={360} height={270}></svg>
                        <div className="graphSelect">
                            <ToggleButtonGroup
                                value={this.state.graph}
                                exclusive
                                onChange={(e, value) => {

                                    if (value === "1") {
                                        $('.line-path').show();
                                        $('.line-path2').hide();
                                    } else if (value === "2") {
                                        $('.line-path2').show();
                                        $('.line-path').hide();
                                    } else if (value === "b") {
                                        $('.line-path').show();
                                        $('.line-path2').show();
                                    }
                                    this.handleChange(e,value);
                                }}
                            >
                                <ToggleButton value="1">
                                    <label>Clip #1</label>
                                </ToggleButton>
                                <ToggleButton value="b">
                                    <label>Both</label>
                                </ToggleButton>
                                <ToggleButton value="2">
                                    <label>Clip #2</label>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                        <div className="table">
                            <TableContainer sx={{ minWidth: 100, maxWidth: 300 }} component={Paper}>
                                <Table aria-label="simple table">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Clip #1 Attack: </TableCell>
                                            <TableCell>{this.state.attack1} ms</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Clip #2 Attack: </TableCell>
                                            <TableCell>{this.state.attack2} ms</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Clip #1 Sustain: </TableCell>
                                            <TableCell>{this.state.sustain1} ms</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Clip #2 Sustain: </TableCell>
                                            <TableCell>{this.state.sustain2} ms</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={this.handleClose}>Back</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default Graphs;
