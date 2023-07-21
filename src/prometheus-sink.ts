export interface PrometheusCounter {
    name: string;
    counter: {
        operation: string;
        value: number;
    }
    labels?: any;
}

export interface PrometheusGauge {
    name: string;
    gauge: {
        operation: string;
        value: number;
    }
    labels?: any;
}