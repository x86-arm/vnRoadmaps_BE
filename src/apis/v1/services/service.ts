import { NextFunction, Request, Response } from 'express';
import { provinces } from 'constants/provinces';
import { HttpException, StatusCode } from 'exceptions';

export const getProvince = async (req: Request, next: NextFunction) => {
    try {
        if (!req.params.slug) {
            throw new HttpException(
                'MissingError',
                StatusCode.BadRequest.status,
                'Missing slug',
                StatusCode.BadRequest.name
            )
        }

        const isFound = provinces.some((element) => {
            return element.slug == req.params.slug;
        });

        if (!isFound) {
            throw new HttpException(
                'NotFound',
                StatusCode.NotFound.status,
                'NotFound Province',
                StatusCode.NotFound.name
            )
        }
        const province = provinces.find((item) => item.slug === req.params.slug);
        return province;
    } catch (error) {
        next(error);
    }
};
export const getProvinceSlug = async (req: Request, next: NextFunction) => {
    try {
        return provinces.map(({ image, thingsToDo, description, mapsUrl, ...keepAttrs }) => keepAttrs);
    } catch (error) {
        next(error);
    }
};