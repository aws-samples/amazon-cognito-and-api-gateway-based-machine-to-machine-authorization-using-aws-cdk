import cdk = require('@aws-cdk/core')

export class TimeUtils {
    public static convertUTC9to0(scope: cdk.Construct, dayOfWeek: string, time: string) {
        const temp = time.split(':');
        var hour: number  = Number(temp[0]) -9;
        if (hour < 0) { 
            hour += 24;

            var tmp = dayOfWeek.split(',');
            for(var i = 0; i< tmp.length; i++){
                if(tmp[i] == 'MON'){
                    tmp[i] = 'SUN'
                }else if(tmp[i] == 'TUE'){
                    tmp[i] = 'MON'
                }else if(tmp[i] == 'WED'){
                    tmp[i] = 'TUE'
                }else if(tmp[i] == 'THU'){
                    tmp[i] = 'WED'
                }else if(tmp[i] == 'FRI'){
                    tmp[i] = 'THU'
                }else if(tmp[i] == 'SAT'){
                    tmp[i] = 'FRI'
                }else if(tmp[i] == 'SUN'){
                    tmp[i] = 'SAT'
                }
            }
            dayOfWeek = tmp.join(',');
        }
        const minute = temp[1]
        return { weekDay: dayOfWeek, hour: `${hour}`, minute: minute }
    }
}