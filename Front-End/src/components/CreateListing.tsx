import React from 'react';
import axios from 'axios';
import {Link, Redirect} from 'react-router-dom';
import {Row, Col, Button, Alert} from 'react-bootstrap';
import {Formik, Field, Form, ErrorMessage, FormikValues} from 'formik';
import * as Yup from 'yup';

export interface FormFields {
  image: File,
  title: string,
  description: string,
  category: number,
  price: number,
  stock_count: number,
}

interface Category {
    id: number;
    name: string;
}

interface IStates {
  categories: Category[],
  isError: boolean;
}

const ListingSchema = Yup.object().shape({
  image: Yup.mixed(),
  title: Yup.string()
    .max(50, 'Please pick a shorter title')
    .required('Title is required'),
  description: Yup.string()
    .max(100, 'The description is over the character limit (100)')
    .required('Description is required'),
  category: Yup.number()
    .required('Please pick a category'),
  price: Yup.number()
    .typeError('Price must be a number')
    .required('Please enter a price')
    .positive ('Price should be positive and greater than 0'),
  stock_count: Yup.number()
    .typeError('stock_count must be a number')
    .required('Please enter a stock_count')
    .moreThan(0.99, 'The minimum stock_count is 1')
});

let imageFile: any = undefined;

class CreateListing extends React.Component<{}, IStates> {

  public readonly state: Readonly<IStates> = {
    categories: [],
    isError: false,
  }

  public async componentDidMount() {
    const result = await axios.get('http://localhost:4000/categories',);
    this.setState({categories: result.data});
  }

  private handleSubmit = async (values: FormikValues, actions: any) => {
    let formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', values.title);
    formData.append('category', values.category);
    formData.append('description', values.description);
    formData.append('price', values.price);
    formData.append('stock_count', values.stock_count);
  

     await axios.post('http://localhost:4000/listings', formData);

  }

  private onChangeHandler(event: any) {
    imageFile = event.target.files[0];
  }

  public render() {
    const { categories, isError } = this.state;
    return (
      <Formik

      initialValues={
        {
          image: undefined,
          title: '',
          description: '',
          category: undefined,
          price: undefined,
          stock_count: undefined,
        }}

        validationSchema={ListingSchema}

        onSubmit={(values: FormikValues, actions: any) => {
          actions.setSubmitting(true);
          this.handleSubmit(values, actions);
        }}
        >
        {({ touched, errors, isSubmitting }) => (
          <Form>

            <h5> Photos </h5>
            <p> Please choose a good quality photo to showcase your product. </p>
            <div>
            <Row>
            <Col lg = {"auto"}>
            <Field
            onChange = {this.onChangeHandler}
            type = "file"
            name = "image"
            className={`form-control styled-input listing-input ${
              touched.image && errors.image ? "is-invalid" : ""
            }`}
            />
            <ErrorMessage
            component = "div"
            name = "image"
            className = "invalid-feedback"
            />
            </Col>
            </Row>
            </div>
            <br/>
            <br/>

            <h5> Listing Details </h5>
            <br/>
            <div>
            <Row>
            <Col lg = {2}> <label htmlFor="title">Title*</label> </Col>
            <Col lg = {5}>
            <Field
            name = "title"
            className={`form-control styled-input listing-input ${
              touched.title && errors.title ? "is-invalid" : ""
            }`}
            />
            <ErrorMessage
            component = "div"
            name = "title"
            className = "invalid-feedback"
            />
            </Col>
            </Row>
            <Row>
            <Col className="text-muted" lg = {{offset: 2}}>
            Add a short title for your listing.
            </Col>
            </Row>
            </div>
            <br/>

            <div>
            <Row>
            <Col lg = {2} > <label htmlFor="description">Description*</label> </Col>
            <Col lg = {5}>
            <Field
            component = "textarea"
            style={{height: '100px'}}
            name = "description"
            className={`form-control styled-input listing-input ${
              touched.description && errors.description ? "is-invalid" : ""
            }`}
            />
            <ErrorMessage
            component = "div"
            name = "description"
            className = "invalid-feedback"
            />
            </Col>
            </Row>
            <Row>
            <Col className="text-muted" lg = {{offset: 2}}>
            Add a short description of your product (100 characters max).
            </Col>
            </Row>
            </div>
            <br/>

            <div>
            <Row>
            <Col lg = {2} > <label htmlFor="category">Category*</label> </Col>
            <Col lg = {5}>
            <Field
            component = "select"
            name = "category"
            className={`form-control styled-input listing-input ${
              touched.category && errors.category ? "is-invalid" : ""
            }`}>
            <option disabled value = "" selected> -- select a category -- </option>
            {categories.map(e => <option value={e.id}>{e.name}</option>)};
            </Field>
            <ErrorMessage
            component = "div"
            name = "category"
            className = "invalid-feedback"
            />
            </Col>
            </Row>
            <Row>
            <Col className="text-muted" lg = {{offset: 2}}>
            Please pick 1 category that matches your product.
            </Col>
            </Row>
            </div>
            <br/>


            <h5> Inventory and Pricing </h5>
            <br/>
            <div>
            <Row>
            <Col lg = {2}> <label htmlFor="price">Product Price*</label> </Col>
            <Col lg = {5}>
            <Field
            name = "price"
            className={`form-control styled-input listing-input ${
              touched.price && errors.price ? "is-invalid" : ""
            }`}
            />
            <ErrorMessage
            component = "div"
            name = "price"
            className = "invalid-feedback"
            />
            </Col>
            </Row>
            <Row>
            <Col className="text-muted" lg = {{offset: 2}}>
             Enter the price before tax.
            </Col>
            </Row>
            </div>
            <br/>

            <div>
            <Row>
            <Col lg = {2}> <label htmlFor="stock_count">Quantity*</label> </Col>
            <Col lg = {5}>
            <Field
            name = "stock_count"
            className={`form-control styled-input listing-input ${
              touched.stock_count && errors.stock_count ? "is-invalid" : ""
            }`}
            />
            <ErrorMessage
            component = "div"
            name = "stock_count"
            className = "invalid-feedback"
            />
            </Col>
            </Row>
            <Row>
            <Col className="text-muted" lg = {{offset: 2}}>
             Enter your current stock count.
            </Col>
            </Row>
            </div>
            <br/>

            <Button
            type="submit"
            className="btn styled-button post"
            disabled={isSubmitting}
                      >
                     {isSubmitting ? 'Please wait...' : 'Post'}
            </Button>

          </Form>
        )}
        </Formik>
      );
    }
  }

  export default CreateListing;
