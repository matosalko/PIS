create table users(
    id serial primary key,
    name text not null,
    surname text not null,
    email text not null,
    password text not null,
    reset_token text,
    date_of_birth date not null,
    registered_at date not null,
    notification text not null,
    user_type text not null,
    phone text,
    address text
);

create table vehicle(
    id serial primary key,
    ecv text not null,
    model text not null,
    manufactured_at integer not null,
    displacement integer not null ,
    power integer not null ,
    category text not null
);

create table insurance(
    id serial primary key,
    vehicle_id integer,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle (id),
    user_id integer,
    FOREIGN KEY (user_id) REFERENCES users (id),
    insurance_number text not null,
    created_at date not null,
    insurance_end_date date not null,
    price double precision not null,
    discount integer
);

create table product_packages(
    id serial primary key,
    name text not null,
    description text not null,
    price double precision not null
);

create table insurance_packages(
    id serial primary key,
    insurance_id integer,
    FOREIGN KEY (insurance_id) REFERENCES insurance (id),
    package_id integer,
    FOREIGN KEY (package_id) REFERENCES product_packages (id)
);

create table changed_insurance(
    id serial primary key,
    insurance_id integer,
    FOREIGN KEY (insurance_id) REFERENCES insurance (id),
    state text not null,
    message text,
    price double precision not null,
    discount integer
);

create table changed_insurance_packages(
    id serial primary key,
    changed_insurance_id integer,
    FOREIGN KEY (changed_insurance_id) REFERENCES changed_insurance (id),
    package_id integer,
    FOREIGN KEY (package_id) REFERENCES product_packages (id)
)